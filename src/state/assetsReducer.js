import { createId } from '../domain/assetModel';

export const ACTIONS = {
  ADD: 'add',
  UPDATE: 'update',
  DELETE: 'delete',
  RESET: 'reset',
};

export function assetsReducer(state, action) {
  switch (action.type) {
    case ACTIONS.ADD:
      return [...state, { ...action.payload, id: createId() }];

    case ACTIONS.UPDATE:
      return state.map((asset) =>
        asset.id === action.payload.id ? { ...asset, ...action.payload.changes } : asset,
      );

    case ACTIONS.DELETE:
      return state.filter((asset) => asset.id !== action.payload.id);

    case ACTIONS.RESET:
      return action.payload.assets;

    default:
      return state;
  }
}
