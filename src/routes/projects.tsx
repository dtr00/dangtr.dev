import { IconArrowUpRight } from '@tabler/icons-react'
import { createFileRoute } from '@tanstack/react-router'

import composeNotesAiImage from '#/features/projects/assets/compose-notes-ai.webp'
import BackHeader from '#/features/shell/components/back-header'

export const Route = createFileRoute('/projects')({
  head: () => ({
    meta: [{ title: 'projects' }],
  }),
  component: Projects,
})

type Project = {
  name: string
  href: string
  github: string
  description: string
  image?: { src: string; alt: string; width: number; height: number }
}

const projects: Project[] = [
  {
    name: 'compose notes ai',
    href: 'https://www.composenotesai.com',
    github: 'https://github.com/dtr00/composenotesai',
    description:
      'your notes, composed with local ai agents. private, offline, and on your own machine.',
    image: {
      src: composeNotesAiImage,
      alt: 'compose notes ai with a kyoto trip note open and the ai chat beside it',
      width: 1200,
      height: 630,
    },
  },
  {
    name: 'dangtr.dev',
    href: 'https://dangtr.dev',
    github: 'https://github.com/dtr00/dangtr.dev',
    description: 'this site',
  },
]

function Projects() {
  return (
    <main className="mx-auto min-h-dvh w-full max-w-3xl px-6 pt-8 sm:px-8">
      <BackHeader />
      <ul className="mt-16 space-y-6 text-lg">
        {projects.map((project) => (
          <li key={project.name}>
            <div className="flex flex-wrap items-center gap-x-4">
              <a
                href={project.href}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 text-foreground"
              >
                <span className="underline underline-offset-4">
                  {project.name}
                </span>
                <IconArrowUpRight aria-hidden size={16} stroke={1.75} />
                <span className="sr-only">(opens in a new tab)</span>
              </a>
              <a
                href={project.github}
                target="_blank"
                rel="noreferrer"
                className="text-muted-foreground underline underline-offset-4"
              >
                github
                <span className="sr-only"> (opens in a new tab)</span>
              </a>
            </div>
            <p className="mt-1 text-muted-foreground">{project.description}</p>
            {project.image ? (
              <img
                src={project.image.src}
                alt={project.image.alt}
                width={project.image.width}
                height={project.image.height}
                decoding="async"
                className="mt-4 h-auto w-full rounded-lg border border-border"
              />
            ) : null}
          </li>
        ))}
      </ul>
    </main>
  )
}
