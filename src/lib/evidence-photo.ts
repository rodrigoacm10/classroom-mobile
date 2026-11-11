import * as ImagePicker from 'expo-image-picker';

const MAX_EVIDENCE_BYTES = 5 * 1024 * 1024;

const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'] as const;

export type EvidenceMimeType = (typeof ALLOWED_MIME_TYPES)[number];

export type CapturedEvidence = {
  uri: string;
  mimeType: EvidenceMimeType;
  fileName: string;
  fileSize: number | null;
};

export class EvidencePhotoError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'EvidencePhotoError';
  }
}

function extensionFor(mimeType: EvidenceMimeType): string {
  if (mimeType === 'image/png') return 'png';
  if (mimeType === 'image/webp') return 'webp';
  return 'jpg';
}

function mimeTypeFromAsset(asset: ImagePicker.ImagePickerAsset): EvidenceMimeType | null {
  const declared = asset.mimeType?.toLowerCase();
  if (declared && ALLOWED_MIME_TYPES.includes(declared as EvidenceMimeType)) {
    return declared as EvidenceMimeType;
  }

  const extension = asset.uri.split('?')[0]?.split('.').pop()?.toLowerCase();
  if (extension === 'png') return 'image/png';
  if (extension === 'webp') return 'image/webp';
  if (extension === 'jpg' || extension === 'jpeg') return 'image/jpeg';
  return null;
}

/**
 * Abre a câmera e devolve a foto pronta para o upload.
 * Retorna null quando a pessoa cancela. A galeria fica de fora de propósito:
 * a evidência precisa ser uma foto tirada na hora.
 */
export async function captureEvidencePhoto(): Promise<CapturedEvidence | null> {
  const permission = await ImagePicker.requestCameraPermissionsAsync();
  if (!permission.granted) {
    throw new EvidencePhotoError(
      permission.canAskAgain
        ? 'Permita o uso da câmera para anexar a foto de evidência.'
        : 'A câmera está bloqueada nas configurações do aparelho. Libere o acesso do Locus para anexar a foto de evidência.',
    );
  }

  const result = await ImagePicker.launchCameraAsync({
    mediaTypes: ['images'],
    quality: 0.6,
    exif: false,
    allowsEditing: false,
    preferredAssetRepresentationMode:
      ImagePicker.UIImagePickerPreferredAssetRepresentationMode.Compatible,
  });

  if (result.canceled || !result.assets[0]) {
    return null;
  }

  const asset = result.assets[0];
  const mimeType = mimeTypeFromAsset(asset);
  if (!mimeType) {
    throw new EvidencePhotoError('Use uma foto JPEG, PNG ou WebP.');
  }

  if (asset.fileSize != null && asset.fileSize > MAX_EVIDENCE_BYTES) {
    throw new EvidencePhotoError('Arquivo muito grande. Tamanho máximo: 5 MB.');
  }

  return {
    uri: asset.uri,
    mimeType,
    fileName: `evidencia.${extensionFor(mimeType)}`,
    fileSize: asset.fileSize ?? null,
  };
}
