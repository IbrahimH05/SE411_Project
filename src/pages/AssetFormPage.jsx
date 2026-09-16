import { Navigate, useNavigate, useParams } from 'react-router-dom';

import { AssetForm } from '../components/AssetForm';
import { EMPTY_ASSET, toFormValues } from '../domain/assetModel';
import { useAssets } from '../state/AssetsContext';

export function AssetFormPage({ mode }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const { assets, addAsset, updateAsset, getAssetById } = useAssets();

  const isEdit = mode === 'edit';
  const existing = isEdit ? getAssetById(id) : null;

  if (isEdit && !existing) {
    return <Navigate to="/assets" replace />;
  }

  const handleSubmit = (asset) => {
    if (isEdit) {
      updateAsset(id, asset);
    } else {
      addAsset(asset);
    }
    navigate('/assets');
  };

  return (
    <>
      <div className="page-header">
        <div>
          <h1>{isEdit ? `Edit ${existing.ticker}` : 'Add asset'}</h1>
          <p>
            {isEdit
              ? 'Update the details of this holding.'
              : 'Record a new holding in the portfolio.'}
          </p>
        </div>
      </div>

      <div className="card">
        <AssetForm
          initialValues={isEdit ? toFormValues(existing) : EMPTY_ASSET}
          existingAssets={assets}
          editingId={isEdit ? id : null}
          submitLabel={isEdit ? 'Save changes' : 'Add asset'}
          onSubmit={handleSubmit}
          onCancel={() => navigate('/assets')}
        />
      </div>
    </>
  );
}
