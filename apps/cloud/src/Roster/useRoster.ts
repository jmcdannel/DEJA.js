export function useRoster() {
  const roadnames = [
    {
      value: 'bnsf',
      label: 'BNSF',
      color: 'orange',
    },
    {
      value: 'amtrak',
      label: 'Amtrak',
      color: 'sky',
    },
    {
      value: 'up',
      label: 'Union Pacific',
      color: 'yellow',
    },
    {
      value: 'cn',
      label: 'Canadian National',
      color: 'red',
    },
    {
      value: 'csx',
      label: 'CSX',
      color: 'indigo',
    },
    {
      value: 'ns',
      label: 'Norfolk Southern',
      color: 'zinc',
    },
    {
      value: 'mrl',
      label: 'Montana Rail Link',
      color: 'blue',
    },
    {
      value: 'gn',
      label: 'Great Northern',
      color: 'orange',
    },
    {
      value: 'bn',
      label: 'Burlington Northern',
      color: 'green',
    },
    {
      value: 'santefe',
      label: 'Santa Fe',
      color: 'red',
    },
  ]

  return {
    roadnames,
  }
}

export default useRoster
