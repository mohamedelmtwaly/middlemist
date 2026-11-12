import { Eye, EyeOff, Edit, Trash2, Package } from 'lucide-react';

interface Column<T> {
  key: string;
  header: string;
  render?: (item: T) => React.ReactNode;
  className?: string;
  mobileClassName?: string;
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  emptyMessage?: string;
  onRowClick?: (item: T) => void;
}

export function DataTable<T>({ data, columns, emptyMessage = 'لا توجد بيانات', onRowClick }: DataTableProps<T>) {
  if (data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 sm:py-16 text-center">
        <Package className="h-10 w-10 sm:h-12 sm:w-12 text-[#77796D] mb-4" />
        <p className="text-sm sm:text-base text-[#77796D]">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-[#5E6B2F]/20 overflow-hidden select-none shadow-md hover:shadow-lg transition-shadow duration-300" data-table-container>
      {/* Table Header - Desktop */}
      <div className="hidden md:grid grid-cols-12 gap-3 sm:gap-4 px-4 sm:px-6 py-3 sm:py-4 bg-gradient-to-r from-[#5E6B2F]/10 via-[#F5F5F0] to-[#5E6B2F]/5 border-b border-[#5E6B2F]/20 font-semibold text-xs sm:text-sm text-[#282A18] tracking-tight">
        {columns.map((column) => (
          <div key={column.key} className={column.className + ' text-center'}>
            {column.header}
          </div>
        ))}
      </div>

      {/* Table Body */}
      <div className="divide-y divide-[#5E6B2F]">
        {data.map((item, index) => (
          <div
            key={index}
            className={`
              ${onRowClick ? 'cursor-pointer' : ''}
            `}
            onClick={() => onRowClick?.(item)}
          >
            {/* Mobile Layout - Card Style */}
            <div className="md:hidden px-4 py-4 bg-white border border-[#5E6B2F]/10 rounded-xl mb-4 shadow-md hover:shadow-lg transition-shadow">
              {/* Main info - image + name */}
              <div className="mb-3 pb-3 border-b border-[#5E6B2F]/10">
                {columns.find(c => c.key === 'product')?.render?.(item) || columns.find(c => c.key === 'category')?.render?.(item)}
              </div>

              {/* Price and Category - Combined */}
              <div className="flex gap-3 mb-3">
                {columns.find(c => c.key === 'price') && (
                  <div className="flex-1 flex flex-col bg-[#F5F5F0]/30 rounded-xl p-2.5">
                    <span className="text-xs text-[#77796D] mb-1 select-none flex-shrink-0">{columns.find(c => c.key === 'price')?.header}</span>
                    <div className="overflow-hidden">
                      {columns.find(c => c.key === 'price')?.render?.(item)}
                    </div>
                  </div>
                )}
                {columns.find(c => c.key === 'category') && (
                  <div className="flex-1 flex flex-col bg-[#F5F5F0]/30 rounded-xl p-2.5">
                    <span className="text-xs text-[#77796D] mb-1 select-none flex-shrink-0">{columns.find(c => c.key === 'category')?.header}</span>
                    <div className="overflow-hidden">
                      {columns.find(c => c.key === 'category')?.render?.(item)}
                    </div>
                  </div>
                )}
              </div>

              {/* Grid layout for remaining columns */}
              <div className="grid grid-cols-2 gap-3 mb-3">
                {columns
                  .filter(c => c.key !== 'product' && c.key !== 'category' && c.key !== 'actions' && c.key !== 'price')
                  .map((column) => (
                    <div key={column.key} className="flex flex-col bg-[#F5F5F0]/30 rounded-xl p-2.5 border-b border-[#5E6B2F]/10 last:border-b-0">
                      <span className="text-xs text-[#77796D] mb-1 select-none flex-shrink-0">{column.header}</span>
                      <div className="overflow-hidden">
                        {column.render ? column.render(item) : (item as any)[column.key]}
                      </div>
                    </div>
                  ))}
              </div>

              {/* Actions - Bottom Bar */}
              <div className="pt-3 border-t border-[#5E6B2F]/10 flex justify-center">
                {columns.find(c => c.key === 'actions')?.render?.(item)}
              </div>
            </div>

            {/* Desktop Layout */}
            <div className="hidden md:grid grid-cols-12 gap-3 sm:gap-4 px-4 md:px-6 py-4 sm:py-5 hover:bg-gradient-to-r hover:from-[#5E6B2F]/5 hover:to-[#F5F5F0]/50 transition-all duration-300 items-center relative">
              {columns.map((column, index) => (
                <div key={column.key} className={column.className + ' overflow-hidden relative text-center' + (index < columns.length - 1 ? ' border-l border-[#5E6B2F]/10' : '')}>
                  {column.render ? column.render(item) : (item as any)[column.key]}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function StatusBadge({ status }: { status: 'active' | 'inactive' | string }) {
  const isActive = status === 'active' || status === 'ظاهر';

  return (
    <span
      className={`
        inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold shadow-sm transition-all duration-300
        ${isActive
          ? 'bg-gradient-to-r from-green-50 to-green-100 text-green-700 border border-green-200 hover:shadow-md'
          : 'bg-gradient-to-r from-gray-50 to-gray-100 text-gray-600 border border-gray-200 hover:shadow-md'
        }
      `}
    >
      {isActive ? (
        <>
          <Eye className="h-3.5 w-3.5" />
          <span>ظاهر</span>
        </>
      ) : (
        <>
          <EyeOff className="h-3.5 w-3.5" />
          <span>مخفي</span>
        </>
      )}
    </span>
  );
}

export function ActionButtons({ onView, onEdit, onToggle, onDelete, isActive }: {
  onView?: () => void;
  onEdit?: () => void;
  onToggle?: () => void;
  onDelete?: () => void;
  isActive?: boolean;
}) {
  return (
    <div className="flex items-center gap-1.5">
      {onEdit && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onEdit();
          }}
          className="md:hidden flex items-center gap-1.5 px-3 py-2 rounded-lg bg-gradient-to-r from-[#5E6B2F] to-[#4a5525] text-white text-xs font-semibold hover:from-[#4a5525] hover:to-[#3d4420] transition-all duration-300 active:scale-95 shadow-md hover:shadow-lg"
        >
          <Edit className="h-3.5 w-3.5" />
          <span>تعديل</span>
        </button>
      )}
      {onEdit && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onEdit();
          }}
          className="hidden md:block p-2 rounded-lg hover:bg-blue-50 text-blue-600 transition-all duration-300 active:scale-95 hover:shadow-md"
          title="تعديل"
        >
          <Edit className="h-4 w-4" />
        </button>
      )}
      {onToggle && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggle();
          }}
          className="md:hidden flex items-center gap-1.5 px-3 py-2 rounded-lg bg-gradient-to-r from-[#F5F5F0] to-[#E9EAE3] text-[#282A18] text-xs font-semibold hover:from-[#E9EAE3] hover:to-[#D9D9D0] transition-all duration-300 active:scale-95 shadow-sm hover:shadow-md"
        >
          {isActive ? (
            <>
              <Eye className="h-3.5 w-3.5" />
              <span>إخفاء</span>
            </>
          ) : (
            <>
              <EyeOff className="h-3.5 w-3.5" />
              <span>إظهار</span>
            </>
          )}
        </button>
      )}
      {onToggle && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggle();
          }}
          className="hidden md:block p-2 rounded-lg hover:bg-gray-50 text-gray-600 transition-all duration-300 active:scale-95 hover:shadow-md"
          title={isActive ? 'إخفاء' : 'إظهار'}
        >
          {isActive ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
        </button>
      )}
      {onDelete && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          className="md:hidden flex items-center gap-1.5 px-3 py-2 rounded-lg bg-gradient-to-r from-red-50 to-red-100 text-red-600 text-xs font-semibold hover:from-red-100 hover:to-red-200 transition-all duration-300 active:scale-95 shadow-sm hover:shadow-md"
        >
          <Trash2 className="h-3.5 w-3.5" />
          <span>حذف</span>
        </button>
      )}
      {onDelete && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          className="hidden md:block p-2 rounded-lg hover:bg-red-50 text-red-600 transition-all duration-300 active:scale-95 hover:shadow-md"
          title="حذف"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      )}
      {onView && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onView();
          }}
          className="p-2 rounded-lg hover:bg-green-50 text-green-600 transition-all duration-300 active:scale-95 hover:shadow-md"
          title="عرض"
        >
          <Eye className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}
