import zhcn from './zh-cn';
import zhcnte from './zh-cn-te';
import zhtw from './zh-tw';
import zhtwte from './zh-tw-te';


export default {
  'zh-cn': { ...zhcnte, ...zhcn },
  'zh-tw': { ...zhtwte, ...zhtw },
};
