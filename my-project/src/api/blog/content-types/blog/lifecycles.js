console.log('Lifecycle hooks for blog loaded!');

module.exports = {
  async afterCreate(event) {
    console.log('afterCreate hook triggered:', event.result);
  },
  async afterUpdate(event) {
    console.log('afterUpdate hook triggered:', event.result);
  },
  async afterDelete(event) {
    console.log('afterDelete hook triggered:', event.result);
  },
};
