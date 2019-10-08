export default {
  getLocaleData(msg) {
    return [
      {
        id: 'no-order',
        text: msg.answer_command.no_order,
      },
      {
        id: 'order_track',
        text: msg.answer_command.order_track,
      },
      {
        id: 'order_info',
        text: msg.answer_command.order_info,
      },
      {
        id: 'scene_id',
        text: msg.answer_command.scene_id,
      },
      {
        id: 'cash',
        text: msg.answer_command.cash,
      },
      {
        id: 'order_cancel',
        text: msg.answer_command.order_cancel,
      },
      {
        id: 'apply_for_return',
        text: msg.answer_command.apply_for_return,
      },
      {
        id: 'exchange_goods',
        text: msg.answer_command.exchange_goods,
      },
      {
        id: 'vip_finance',
        text: msg.answer_command.vip_finance,
      },
      {
        id: 'query_refund',
        text: msg.answer_command.query_refund,
      },
      {
        id: 'shopping',
        text: msg.answer_command.shopping,
      },
    ];
  },
};
