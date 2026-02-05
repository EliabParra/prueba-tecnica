export interface InventoryReportDTO {
  productCode: number
  productDescription?: string | null
  movementNumber: number
  movementType?: string | null
  warehouse?: string | null
  quantity: number
}

export interface InventoryStockDTO {
  productId: number
  productName?: string | null
  warehouseId: number
  warehouseName?: string | null
  currentStock: number
  minStock: number
}

export interface LowStockProductDTO {
  name?: string | null
  currentStock: number
  minStock: number
}

export interface DashboardStatsDTO {
  totalProducts: number
  totalStock: number
  lowStockCount: number
  lowStockProducts?: LowStockProductDTO[] | null
}

export interface MovementRequestDTO {
  productId: number
  warehouseId: number
  movementType?: string | null
  quantity: number
  description?: string | null
}

export interface TransferRequestDTO {
  productId: number
  sourceWarehouseId: number
  targetWarehouseId: number
  quantity: number
}
