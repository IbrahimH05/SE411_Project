import { useCallback, useMemo, useReducer } from 'react';

import { seedAssets } from '../data/seedAssets';
import { AssetsContext } from './AssetsContext';
import { ACTIONS, assetsReducer } from './assetsReducer';

export function AssetsProvider({ children, initialAssets = seedAssets }) {
  const [assets, dispatch] = useReducer(assetsReducer, initialAssets);

  const addAsset = useCallback((asset) => dispatch({ type: ACTIONS.ADD, payload: asset }), []);

  const updateAsset = useCallback(
    (id, changes) => dispatch({ type: ACTIONS.UPDATE, payload: { id, changes } }),
    [],
  );

  const deleteAsset = useCallback(
    (id) => dispatch({ type: ACTIONS.DELETE, payload: { id } }),
    [],
  );

  const resetAssets = useCallback(
    (nextAssets = seedAssets) => dispatch({ type: ACTIONS.RESET, payload: { assets: nextAssets } }),
    [],
  );

  const getAssetById = useCallback((id) => assets.find((asset) => asset.id === id), [assets]);

  const value = useMemo(
    () => ({ assets, addAsset, updateAsset, deleteAsset, resetAssets, getAssetById }),
    [assets, addAsset, updateAsset, deleteAsset, resetAssets, getAssetById],
  );

  return <AssetsContext.Provider value={value}>{children}</AssetsContext.Provider>;
}
