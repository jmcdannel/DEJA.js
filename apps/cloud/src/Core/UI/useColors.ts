export function useColors() {
  const DEFAULT_COLOR = 'blue'
  const colorList = [
    {
      value: 'slate',
      label: 'slate',
      color: 'slate',
      text: 'text-slate-500 dard:text-slate-400',
      border: 'border-slate-500 dark:border-slate-400',
      bg: 'bg-slate-500 dark:bg-slate-400',
    },
    {
      value: 'zinc',
      label: 'zinc',
      color: 'zinc',
      text: 'text-zinc-500 dark:text-zinc-400',
      border: 'border-zinc-500 dark:border-zinc-400',
      bg: 'bg-zinc-500 dark:bg-zinc-400',
    },
    {
      value: 'stone',
      label: 'stone',
      color: 'stone',
      text: 'text-stone-500 dark:text-stone-400',
      border: 'border-stone-500 dark:border-stone-400',
      bg: 'bg-stone-500 dark:bg-stone-400',
    },
    {
      value: 'red',
      label: 'red',
      color: 'red',
      text: 'text-red-500 dark:text-red-400',
      border: 'border-red-500 dark:border-red-400',
      bg: 'bg-red-500 dark:bg-red-400',
    },
    {
      value: 'orange',
      label: 'orange',
      color: 'orange',
      text: 'text-orange-500 dark:text-orange-400',
      border: 'border-orange-500 dark:border-orange-400',
      bg: 'bg-orange-500 dark:bg-orange-400',
    },
    {
      value: 'amber',
      label: 'amber',
      color: 'amber',
      text: 'text-amber-500 dark:text-amber-400',
      border: 'border-amber-500 dark:border-amber-400',
      bg: 'bg-amber-500 dark:bg-amber-400',
    },
    {
      value: 'yellow',
      label: 'yellow',
      color: 'yellow',
      text: 'text-yellow-500 dark:text-yellow-400',
      border: 'border-yellow-500 dark:border-yellow-400',
      bg: 'bg-yellow-500 dark:bg-yellow-400',
    },
    {
      value: 'lime',
      label: 'Lime',
      color: 'lime',
      text: 'text-lime-500 dark:text-lime-400',
      border: 'border-lime-500 dark:border-lime-400',
      bg: 'bg-lime-500 dark:bg-lime-400',
    },
    {
      value: 'green',
      label: 'green',
      color: 'green',
      text: 'text-green-500 dark:text-green-400',
      border: 'border-green-500 dark:border-green-400',
      bg: 'bg-green-500 dark:bg-green-400',
    },
    {
      value: 'emerald',
      label: 'emerald',
      color: 'emerald',
      text: 'text-emerald-500 dark:text-emerald-400',
      border: 'border-emerald-500 dark:border-emerald-400',
      bg: 'bg-emerald-500 dark:bg-emerald-400',
    },
    {
      value: 'teal',
      label: 'teal',
      color: 'teal',
      text: 'text-teal-500 dark:text-teal-400',
      border: 'border-teal-500 dark:border-teal-400',
      bg: 'bg-teal-500 dark:bg-teal-400',
    },
    {
      value: 'cyan',
      label: 'cyan',
      color: 'cyan',
      text: 'text-cyan-500 dark:text-cyan-400',
      border: 'border-cyan-500 dark:border-cyan-400',
      bg: 'bg-cyan-500 dark:bg-cyan-400',
    },
    {
      value: 'sky',
      label: 'sky',
      color: 'sky',
      text: 'text-sky-500 dark:text-sky-400',
      border: 'border-sky-500 dark:border-sky-400',
      bg: 'bg-sky-500 dark:bg-sky-400',
    },
    {
      value: 'blue',
      label: 'blue',
      color: 'blue',
      text: 'text-blue-500 dark:text-blue-400',
      border: 'border-blue-500 dark:border-blue-400',
      bg: 'bg-blue-500 dark:bg-blue-400',
    },
    {
      value: 'indigo',
      label: 'indigo',
      color: 'indigo',
      text: 'text-indigo-500 dark:text-indigo-400',
      border: 'border-indigo-500 dark:border-indigo-400',
      bg: 'bg-indigo-500 dark:bg-indigo-400',
    },
    {
      value: 'violet',
      label: 'violet',
      color: 'violet',
      text: 'text-violet-500 dark:text-violet-400',
      border: 'border-violet-500 dark:border-violet-400',
      bg: 'bg-violet-500 dark:bg-violet-400',
    },
    {
      value: 'purple',
      label: 'purple',
      color: 'purple',
      text: 'text-purple-500 dark:text-purple-400',
      border: 'border-purple-500 dark:border-purple-400',
      bg: 'bg-purple-500 dark:bg-purple-400',
    },
    {
      value: 'fuchsia',
      label: 'fuchsia',
      color: 'fuchsia',
      text: 'text-fuchsia-500 dark:text-fuchsia-400',
      border: 'border-fiushia-500 dark:border-fuchsia-400',
      bg: 'bg-fuchsia-500 dark:bg-fuchsia-400',
    },
    {
      value: 'pink',
      label: 'pink',
      color: 'pink',
      text: 'text-pink-500 dark:text-pink-400',
      border: 'border-pink-500 dark:border-pink-400',
      bg: 'bg-pink-500 dark:bg-pink-400',
    },
    {
      value: 'rose',
      label: 'rose',
      color: 'rose',
      text: 'text-rose-500 dark:text-rose-400',
      border: 'border-rose-500 dark:border-rose-400',
      bg: 'bg-rose-500 dark:bg-rose-400',
    },
  ]

  const colors = colorList.reduce(
    (acc: { [key: string]: (typeof colorList)[0] }, color) => {
      acc[color.value] = color
      return acc
    },
    {}
  )

  function getColor(color: string) {
    return colors[color] || colors[DEFAULT_COLOR]
  }

  return {
    colorList,
    colors,
    DEFAULT_COLOR,
    getColor,
  }
}