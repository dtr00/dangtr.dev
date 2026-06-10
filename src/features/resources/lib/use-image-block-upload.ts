import { useMutation } from 'convex/react'
import { useRef, useState } from 'react'

import { api } from '../../../../convex/_generated/api'
import type { Id } from '../../../../convex/_generated/dataModel'
import { getSaveErrorMessage } from '@/lib/save-error-message'
import { MAX_IMAGE_BYTES } from '../../../../convex/features/resources/lib/limits'
import { processImageForUpload } from '#/features/resources/lib/process-image'

const ACCEPTED_IMAGE_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/avif',
])

type UploadResponse = {
  storageId: Id<'_storage'>
}

function isUploadResponse(value: unknown): value is UploadResponse {
  if (typeof value !== 'object' || value === null) {
    return false
  }

  if (!('storageId' in value)) {
    return false
  }

  const storageId = value.storageId
  return typeof storageId === 'string' && storageId.length > 0
}

export function useImageBlockUpload(blockId: Id<'resourceBlocks'>) {
  const generateUploadUrl = useMutation(
    api.features.resources.blocks.mutations.generateUploadUrl,
  )
  const attachUploadedImage = useMutation(
    api.features.resources.blocks.mutations.attachUploadedImage,
  )
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [isDragActive, setIsDragActive] = useState(false)

  async function uploadFile(file: File) {
    if (!ACCEPTED_IMAGE_TYPES.has(file.type)) {
      setUploadError('Use a JPEG, PNG, WebP, GIF, or AVIF image.')
      return
    }

    if (file.size > MAX_IMAGE_BYTES) {
      setUploadError('Image must be 10 MB or smaller.')
      return
    }

    setUploadError(null)
    setIsUploading(true)

    try {
      const processedImage = await processImageForUpload(file)
      const uploadUrl = await generateUploadUrl({})
      const uploadResult = await fetch(uploadUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'image/webp' },
        body: processedImage,
      })

      if (!uploadResult.ok) {
        throw new Error('Upload failed')
      }

      const uploadJson: unknown = await uploadResult.json()

      if (!isUploadResponse(uploadJson)) {
        throw new Error('Upload failed')
      }

      await attachUploadedImage({
        blockId,
        storageId: uploadJson.storageId,
      })
    } catch (error) {
      setUploadError(getSaveErrorMessage(error))
    } finally {
      setIsUploading(false)
    }
  }

  function handleFileSelection(files: FileList | null) {
    const file = files?.item(0)

    if (!file) {
      return
    }

    void uploadFile(file)
  }

  return {
    fileInputRef,
    isUploading,
    uploadError,
    isDragActive,
    setIsDragActive,
    handleFileSelection,
    openFilePicker: () => fileInputRef.current?.click(),
  }
}
