import { RelationshipDefinition } from '@orbit/data';

import Model from '../model';
import { getHasOneCache } from '../utils/property-cache';
import { defineRelationship } from '../utils/model-definition';

export default function hasOne(
  type: string | string[],
  options: Partial<RelationshipDefinition> = {}
) {
  function trackedHasOne(target: any, property: string, _: PropertyDescriptor) {
    if (!options.type) {
      throw new TypeError('@hasOne() require `type` argument.');
    }

    function get(this: Model) {
      return getHasOneCache(this, property).value;
    }

    function set(this: Model, value: any) {
      const oldValue = this.getRelatedRecord(property);

      if (value !== oldValue) {
        this.assertMutableFields();
        this.replaceRelatedRecord(property, value).catch(() =>
          getHasOneCache(this, property).notifyPropertyChange()
        );
      }
    }

    defineRelationship(target, property, options);

    return { get, set };
  }

  if (arguments.length === 3) {
    options = {};
    return trackedHasOne.apply(null, arguments);
  }

  options.type = type;
  options.kind = 'hasOne';
  return trackedHasOne;
}
