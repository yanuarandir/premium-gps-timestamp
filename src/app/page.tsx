import { EditorWorkspace } from '@/components/editor/EditorWorkspace'
import { PasswordGuard } from '@/components/PasswordGuard'

export default function Home() {
  return (
    <main className="min-h-screen w-full bg-[#000000]">
      <PasswordGuard>
        <EditorWorkspace />
      </PasswordGuard>
    </main>
  )
}
