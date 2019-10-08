// TODO get it from database
export default {
  getLocaleData(msg) {
    return [
      {
        key: 'categories',
        text: msg.dimension.categories.title,
        categories: [
          {
            id: 1,
            type: 'platform',
            text: msg.dimension.categories.platform,
            allChecked: true,
            values: [
            ],
          },
          {
            id: 2,
            type: 'brand',
            text: msg.dimension.categories.brand.title,
            allChecked: true,
            values: [
              {
                id: 'sms',
                text: msg.dimension.categories.brand.sms,
                checked: false,
                tagId: 23,
              },
              {
                id: 'wechat',
                text: msg.dimension.categories.brand.wechat,
                checked: false,
                tagId: 24,
              },
              {
                id: 'phone_app',
                text: msg.dimension.categories.brand.phone_app,
                checked: false,
                tagId: 27,
              },
              {
                id: 'e_line',
                text: msg.dimension.categories.brand.e_line,
                checked: false,
                tagId: 29,
              },
              {
                id: 'fortune_group',
                text: msg.dimension.categories.brand.fortune_group,
                checked: false,
                tagId: 30,
              },
            ],
          },
          {
            id: 3,
            type: 'sex',
            text: msg.dimension.categories.sex.title,
            allChecked: true,
            values: [
              {
                id: '0',
                text: msg.dimension.categories.sex['0'],
                checked: false,
                tagId: 8,
              },
              {
                id: '1',
                text: msg.dimension.categories.sex['1'],
                checked: false,
                tagId: 7,
              },
            ],
          },
          // {
          //   type: 'age',
          //   text: msg.dimension.categories.age,
          //   allChecked: true,
          //   values: [
          //     {
          //       id: '70s',
          //       text: '70s',
          //       checked: false,
          //       tagId: 9,
          //     },
          //     {
          //       id: '80s',
          //       text: '80s',
          //       checked: false,
          //       tagId: 10,
          //     },
          //     {
          //       id: '85s',
          //       text: '85s',
          //       checked: false,
          //       tagId: 11,
          //     },
          //     {
          //       id: '90s',
          //       text: '90s',
          //       checked: false,
          //       tagId: 12,
          //     },
          //   ],
          // },
          // {
          //   type: 'hobbies',
          //   text: msg.dimension.categories.hobbies.title,
          //   allChecked: true,
          //   values: [
          //     {
          //       id: '0',
          //       text: msg.dimension.categories.hobbies['0'],
          //       checked: false,
          //       tagId: 14,
          //     },
          //     {
          //       id: '1',
          //       text: msg.dimension.categories.hobbies['1'],
          //       checked: false,
          //       tagId: 13,
          //     },
          //   ],
          // },
        ],
      },
      {
        key: 'emotions',
        text: msg.dimension.emotions.title,
        categories: [
          {
            type: 'emotion',
            text: msg.dimension.emotions.title,
            allChecked: true,
            values: [
              {
                id: 'angry',
                text: msg.dimension.emotions.angry,
                checked: false,
              },
              {
                id: 'not_satisfied',
                text: msg.dimension.emotions.not_satisfied,
                checked: false,
              },
              {
                id: 'neutral',
                text: msg.dimension.emotions.neutral,
                checked: false,
              },
              {
                id: 'satisfied',
                text: msg.dimension.emotions.satisfied,
                checked: false,
              },
            ],
          },
        ],
      },
      {
        key: 'qtypes',
        text: msg.dimension.qtypes.title,
        categories: [
          {
            type: 'qtype',
            text: msg.dimension.qtypes.title,
            allChecked: true,
            values: [
              {
                id: 'business',
                text: msg.dimension.qtypes.business,
                checked: false,
              },
              {
                id: 'chat',
                text: msg.dimension.qtypes.chat,
                checked: false,
              },
              {
                id: 'other',
                text: msg.dimension.qtypes.other,
                checked: false,
              },
            ],
          },
        ],
      },
    ];
  },
};
