const labelMap = [
  {
    test: /期間限定海域|イベント/,
    label: '活动',
  },
  {
    test: /改二/,
    label: '改二',
  },
  {
    test: /メンテナンス/,
    label: '维护',
  },
];

/**
 * 解析官推标签
 * @param {string} tweet 日语官推内容
 * @returns {string} 官推标签，以逗号分隔
 */
module.exports = (tweet) => {
  const labels = labelMap.filter(e => e.test.test(tweet))
    .map(e => e.label)
    .join();
  if (labels) return `(${labels})`;
  return '';
};
