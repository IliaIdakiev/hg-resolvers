export const NOTHING = Symbol('NOTHING');
export const MISSING = Symbol('MISSING');

export function diff(obj1, obj2) {
  if (Array.isArray(obj1)) {
    if (!Array.isArray(obj2)) { return obj2; }
    // tslint:disable-next-line:only-arrow-functions space-before-function-paren
    const newKeys = Object.keys(obj2).filter(function (k) { return !Object.keys(obj1).includes(k); });
    // tslint:disable-next-line:only-arrow-functions space-before-function-paren
    let diffResult = obj1.map(function (item, index) { return diff(item, obj2[index]); }).filter(i => i !== NOTHING);
    if (newKeys.length > 0) { diffResult = newKeys.map(key => diffResult[key] = obj2[key]); }
    if (Object.keys(diffResult).length === 0) { return NOTHING; }
    return diffResult;
  }

  if (
    (typeof obj1 === 'object' && !Array.isArray(obj1) && obj1 !== null) &&
    (typeof obj2 === 'object' && !Array.isArray(obj2) && obj2 !== null)
  ) {
    // tslint:disable-next-line:only-arrow-functions space-before-function-paren
    const newKeys = Object.keys(obj2).filter(function (k) { return !Object.keys(obj1).includes(k); });
    let diffResult = Object.entries(obj1).reduce((acc, [key, value]) => {
      const otherValue = obj2.hasOwnProperty(key) ? obj2[key] : MISSING;
      const res = diff(value, otherValue);
      if (res !== NOTHING) { acc[key] = res; }
      return acc;
    }, {});

    // tslint:disable-next-line:only-arrow-functions space-before-function-paren
    diffResult = newKeys.reduce(function (acc, key) {
      acc[key] = obj2[key];
      return acc;
    }, diffResult);

    if (Object.keys(diffResult).length === 0) { return NOTHING; }
    return diffResult;
  }

  return obj1 === obj2 ? NOTHING : obj2;
}
