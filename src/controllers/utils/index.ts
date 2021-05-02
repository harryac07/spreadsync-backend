export const getFormattedDataBody = (dataToFormat) => {
  return dataToFormat.map((each) => {
    const valuesOnly = Object.values(each);
    return valuesOnly.map(eachValue => eachValue)
  })
}

export const getFormattedDataHeader = (dataToFormat = {}) => {
  return Object.keys(dataToFormat)
}

export const getFormattedDataWithHeader = (dataToFormat) => {
  return [
    ...[getFormattedDataHeader(dataToFormat[0])],
    ...getFormattedDataBody(dataToFormat)
  ]
}