import listcmd from './listcmd';
import evaljs from './eval';
import exec from './exec';
import { Command } from '../admin-command';

export default {
  listcmd,
  eval: evaljs,
  exec,
} as Record<string, Command>;
