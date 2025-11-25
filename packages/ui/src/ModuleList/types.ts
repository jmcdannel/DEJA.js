export interface ModuleListItem {
    icon: string
    title: string
    module: string
    id: string
    state: boolean
    device?: string
    name?: string
    color?: string
}

export interface ModuleListViewOption {
    label: string
    value: string
}

export interface ModuleListSortOption {
    label: string
    value: string
}

export interface ModuleListMenuOption {
    color: string
    title: string
    icon: string
    value: string
    ref: string
}

export interface ListFilter {
    type: string
    label: string
    options: { value: string; label: string }[]
    selected?: string
}