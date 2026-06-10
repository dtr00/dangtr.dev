type FieldSaveErrorProps = {
  message: string | null
}

export function FieldSaveError({ message }: FieldSaveErrorProps) {
  if (!message) {
    return null
  }

  return (
    <p role="alert" className="mt-1 text-sm text-destructive">
      {message}
    </p>
  )
}
