import { ModelOptions, ModelOptionsRe } from './type';
import { ReactX } from './ReactX';

function createModel<State extends object, Mutations extends object, Actions extends object>(modelConfig: ModelOptions<State, Mutations, Actions>): ModelOptionsRe<State, Mutations, Actions>{
  return modelConfig as any;
}

export function createReactX<State extends object, Mutations extends object, Actions extends object>(modelConfig: ModelOptions<State, Mutations, Actions>){
  const modalConfig = createModel(modelConfig);
  return new ReactX<typeof modalConfig>(modalConfig);
}
