import { Note } from './db'

export interface MetricEntry {
  botId: string
  date: string
  channel: string
  metric: string
  subMetric?: string
  value: number
}

export interface ViewEntry {
  key: string
  options: {
    name: string
    description: string
    notesDisplay: string
  }
  viewString: string
  state: string
  metadata: any
  note: Note & { changed?: boolean }
  subviews: { id: string; label: string; viewString: string }[]
}
