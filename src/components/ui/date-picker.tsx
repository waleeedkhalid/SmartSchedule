/**
 * DatePicker Component - Ant Design Recreation
 * Fully self-contained date picker matching Ant Design's behavior and styling
 */

import "./date-picker.css";
import React, {
  useState,
  useRef,
  useEffect,
  forwardRef,
  useImperativeHandle,
} from "react";
import {
  Calendar as CalendarIcon,
  X,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export type DateValue = Date | null;
export type DateRangeValue = [Date | null, Date | null];

export interface DatePickerProps {
  /** Current selected date */
  value?: DateValue;
  /** Callback when date changes */
  onChange?: (date: DateValue, dateString: string) => void;
  /** Function to disable specific dates */
  disabledDate?: (date: Date) => boolean;
  /** Placeholder text */
  placeholder?: string;
  /** Date format string (e.g., "YYYY-MM-DD", "MM/DD/YYYY") */
  format?: string;
  /** Show clear button */
  allowClear?: boolean;
  /** Disabled state */
  disabled?: boolean;
  /** Custom className */
  className?: string;
  /** Locale configuration */
  locale?: {
    months: string[];
    weekDays: string[];
    weekDaysShort: string[];
  };
}

export interface RangePickerProps {
  /** Current selected date range */
  value?: DateRangeValue;
  /** Callback when range changes */
  onChange?: (dates: DateRangeValue, dateStrings: [string, string]) => void;
  /** Function to disable specific dates */
  disabledDate?: (date: Date) => boolean;
  /** Placeholder text for start and end */
  placeholder?: [string, string];
  /** Date format string */
  format?: string;
  /** Show clear button */
  allowClear?: boolean;
  /** Disabled state */
  disabled?: boolean;
  /** Custom className */
  className?: string;
  /** Locale configuration */
  locale?: {
    months: string[];
    weekDays: string[];
    weekDaysShort: string[];
  };
}

// ============================================================================
// DEFAULT LOCALE
// ============================================================================

const DEFAULT_LOCALE = {
  months: [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ],
  weekDays: [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ],
  weekDaysShort: ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"],
};

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

function formatDate(date: Date | null, format: string = "YYYY-MM-DD"): string {
  if (!date) return "";

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return format
    .replace("YYYY", String(year))
    .replace("MM", month)
    .replace("DD", day)
    .replace("M", String(date.getMonth() + 1))
    .replace("D", String(date.getDate()));
}

function isSameDay(date1: Date | null, date2: Date | null): boolean {
  if (!date1 || !date2) return false;
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
}

function isToday(date: Date): boolean {
  return isSameDay(date, new Date());
}

function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number): number {
  return new Date(year, month, 1).getDay();
}

// ============================================================================
// CALENDAR COMPONENT
// ============================================================================

interface CalendarProps {
  value: DateValue;
  onChange: (date: Date) => void;
  disabledDate?: (date: Date) => boolean;
  locale: typeof DEFAULT_LOCALE;
  onClose: () => void;
  rangeValue?: DateRangeValue;
  onRangeChange?: (date: Date) => void;
  isRangePicker?: boolean;
}

function Calendar({
  value,
  onChange,
  disabledDate,
  locale,
  onClose,
  rangeValue,
  onRangeChange,
  isRangePicker,
}: CalendarProps) {
  const [viewDate, setViewDate] = useState(value || new Date());
  const [hoveredDate, setHoveredDate] = useState<Date | null>(null);

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();

  const daysInMonth = getDaysInMonth(year, month);
  const firstDayOfWeek = getFirstDayOfMonth(year, month);

  const handlePrevMonth = () => {
    setViewDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setViewDate(new Date(year, month + 1, 1));
  };

  const handlePrevYear = () => {
    setViewDate(new Date(year - 1, month, 1));
  };

  const handleNextYear = () => {
    setViewDate(new Date(year + 1, month, 1));
  };

  const handleDateClick = (day: number) => {
    const selectedDate = new Date(year, month, day);
    if (disabledDate && disabledDate(selectedDate)) return;

    if (isRangePicker && onRangeChange) {
      onRangeChange(selectedDate);
    } else {
      onChange(selectedDate);
      onClose();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      onClose();
    }
  };

  // Generate calendar grid
  const calendarDays: (number | null)[] = [];
  for (let i = 0; i < firstDayOfWeek; i++) {
    calendarDays.push(null);
  }
  for (let day = 1; day <= daysInMonth; day++) {
    calendarDays.push(day);
  }

  const isDateInRange = (date: Date): boolean => {
    if (!rangeValue || !rangeValue[0]) return false;
    const [start, end] = rangeValue;
    const hovered = hoveredDate || end;

    if (!hovered) return false;

    const compareStart = start.getTime();
    const compareEnd = hovered.getTime();
    const compareDate = date.getTime();

    return (
      compareDate >= Math.min(compareStart, compareEnd) &&
      compareDate <= Math.max(compareStart, compareEnd)
    );
  };

  return (
    <div
      className="ant-datepicker-calendar"
      onKeyDown={handleKeyDown}
      role="dialog"
      aria-label="Date picker calendar"
    >
      {/* Header */}
      <div className="ant-datepicker-header">
        <button
          type="button"
          className="ant-datepicker-header-btn"
          onClick={handlePrevYear}
          aria-label="Previous year"
        >
          <ChevronLeft className="w-4 h-4" />
          <ChevronLeft className="w-4 h-4 -ml-2" />
        </button>
        <button
          type="button"
          className="ant-datepicker-header-btn"
          onClick={handlePrevMonth}
          aria-label="Previous month"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <div className="ant-datepicker-header-title">
          {locale.months[month]} {year}
        </div>
        <button
          type="button"
          className="ant-datepicker-header-btn"
          onClick={handleNextMonth}
          aria-label="Next month"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
        <button
          type="button"
          className="ant-datepicker-header-btn"
          onClick={handleNextYear}
          aria-label="Next year"
        >
          <ChevronRight className="w-4 h-4" />
          <ChevronRight className="w-4 h-4 -ml-2" />
        </button>
      </div>

      {/* Week days */}
      <div className="ant-datepicker-weekdays">
        {locale.weekDaysShort.map((day) => (
          <div key={day} className="ant-datepicker-weekday">
            {day}
          </div>
        ))}
      </div>

      {/* Days grid */}
      <div className="ant-datepicker-days">
        {calendarDays.map((day, index) => {
          if (day === null) {
            return (
              <div
                key={`empty-${index}`}
                className="ant-datepicker-day-empty"
              />
            );
          }

          const currentDate = new Date(year, month, day);
          const isSelected = isSameDay(currentDate, value);
          const isTodayDate = isToday(currentDate);
          const isDisabled = disabledDate ? disabledDate(currentDate) : false;
          const isInRange = isRangePicker && isDateInRange(currentDate);
          const isRangeStart =
            rangeValue && isSameDay(currentDate, rangeValue[0]);
          const isRangeEnd =
            rangeValue && isSameDay(currentDate, rangeValue[1]);

          return (
            <button
              key={day}
              type="button"
              className={`ant-datepicker-day ${isSelected ? "selected" : ""} ${
                isTodayDate ? "today" : ""
              } ${isDisabled ? "disabled" : ""} ${
                isInRange ? "in-range" : ""
              } ${isRangeStart ? "range-start" : ""} ${
                isRangeEnd ? "range-end" : ""
              }`}
              onClick={() => handleDateClick(day)}
              disabled={isDisabled}
              onMouseEnter={() => isRangePicker && setHoveredDate(currentDate)}
              aria-label={`${day} ${locale.months[month]} ${year}`}
              aria-current={isSelected ? "date" : undefined}
            >
              {day}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ============================================================================
// DATE PICKER COMPONENT
// ============================================================================

export const DatePicker = forwardRef<HTMLInputElement, DatePickerProps>(
  (
    {
      value,
      onChange,
      disabledDate,
      placeholder = "Select date",
      format = "YYYY-MM-DD",
      allowClear = true,
      disabled = false,
      className = "",
      locale = DEFAULT_LOCALE,
    },
    ref
  ) => {
    const [isOpen, setIsOpen] = useState(false);
    const [inputValue, setInputValue] = useState("");
    const containerRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    useImperativeHandle(ref, () => inputRef.current!);

    useEffect(() => {
      setInputValue(formatDate(value || null, format));
    }, [value, format]);

    useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (
          containerRef.current &&
          !containerRef.current.contains(event.target as Node)
        ) {
          setIsOpen(false);
        }
      };

      if (isOpen) {
        document.addEventListener("mousedown", handleClickOutside);
      }

      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }, [isOpen]);

    const handleInputClick = () => {
      if (!disabled) {
        setIsOpen(!isOpen);
      }
    };

    const handleClear = (e: React.MouseEvent) => {
      e.stopPropagation();
      setInputValue("");
      onChange?.(null, "");
      setIsOpen(false);
    };

    const handleChange = (date: Date) => {
      const formattedDate = formatDate(date, format);
      setInputValue(formattedDate);
      onChange?.(date, formattedDate);
    };

    const handleInputKeyDown = (e: React.KeyboardEvent) => {
      if (e.key === "Enter") {
        setIsOpen(!isOpen);
      } else if (e.key === "Escape") {
        setIsOpen(false);
      }
    };

    return (
      <div
        ref={containerRef}
        className={`ant-datepicker ${disabled ? "disabled" : ""} ${className}`}
      >
        <div
          className="ant-datepicker-input"
          onClick={handleInputClick}
          role="button"
          tabIndex={disabled ? -1 : 0}
          onKeyDown={handleInputKeyDown}
          aria-label="Date picker"
          aria-expanded={isOpen}
          aria-haspopup="dialog"
        >
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            placeholder={placeholder}
            readOnly
            disabled={disabled}
            className="ant-datepicker-input-field"
            aria-label={placeholder}
          />
          <span className="ant-datepicker-suffix">
            {allowClear && inputValue && !disabled ? (
              <button
                type="button"
                className="ant-datepicker-clear-btn"
                onClick={handleClear}
                aria-label="Clear date"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            ) : (
              <CalendarIcon className="w-4 h-4 text-muted-foreground" />
            )}
          </span>
        </div>

        {isOpen && (
          <div className="ant-datepicker-dropdown">
            <Calendar
              value={value || null}
              onChange={handleChange}
              disabledDate={disabledDate}
              locale={locale}
              onClose={() => setIsOpen(false)}
            />
          </div>
        )}
      </div>
    );
  }
);

DatePicker.displayName = "DatePicker";

// ============================================================================
// RANGE PICKER COMPONENT
// ============================================================================

export const RangePicker = forwardRef<HTMLDivElement, RangePickerProps>(
  (
    {
      value,
      onChange,
      disabledDate,
      placeholder = ["Start date", "End date"],
      format = "YYYY-MM-DD",
      allowClear = true,
      disabled = false,
      className = "",
      locale = DEFAULT_LOCALE,
    },
    ref
  ) => {
    const [isOpen, setIsOpen] = useState(false);
    const [rangeValue, setRangeValue] = useState<DateRangeValue>(
      value || [null, null]
    );
    const containerRef = useRef<HTMLDivElement>(null);

    useImperativeHandle(ref, () => containerRef.current!);

    useEffect(() => {
      setRangeValue(value || [null, null]);
    }, [value]);

    useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (
          containerRef.current &&
          !containerRef.current.contains(event.target as Node)
        ) {
          setIsOpen(false);
        }
      };

      if (isOpen) {
        document.addEventListener("mousedown", handleClickOutside);
      }

      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }, [isOpen]);

    const handleRangeChange = (date: Date) => {
      const [start, end] = rangeValue;

      if (!start || (start && end)) {
        // Start new range
        setRangeValue([date, null]);
      } else {
        // Complete range
        const newRange: DateRangeValue =
          date < start ? [date, start] : [start, date];
        setRangeValue(newRange);
        onChange?.(newRange, [
          formatDate(newRange[0], format),
          formatDate(newRange[1], format),
        ]);
        setIsOpen(false);
      }
    };

    const handleClear = (e: React.MouseEvent) => {
      e.stopPropagation();
      setRangeValue([null, null]);
      onChange?.([null, null], ["", ""]);
      setIsOpen(false);
    };

    const handleInputClick = () => {
      if (!disabled) {
        setIsOpen(!isOpen);
      }
    };

    const startValue = rangeValue[0] ? formatDate(rangeValue[0], format) : "";
    const endValue = rangeValue[1] ? formatDate(rangeValue[1], format) : "";
    const hasValue = startValue || endValue;

    return (
      <div
        ref={containerRef}
        className={`ant-datepicker ant-rangepicker ${
          disabled ? "disabled" : ""
        } ${className}`}
      >
        <div
          className="ant-datepicker-input"
          onClick={handleInputClick}
          role="button"
          tabIndex={disabled ? -1 : 0}
          aria-label="Date range picker"
          aria-expanded={isOpen}
          aria-haspopup="dialog"
        >
          <input
            type="text"
            value={startValue}
            placeholder={placeholder[0]}
            readOnly
            disabled={disabled}
            className="ant-datepicker-input-field"
            aria-label={placeholder[0]}
          />
          <span className="ant-datepicker-separator">~</span>
          <input
            type="text"
            value={endValue}
            placeholder={placeholder[1]}
            readOnly
            disabled={disabled}
            className="ant-datepicker-input-field"
            aria-label={placeholder[1]}
          />
          <span className="ant-datepicker-suffix">
            {allowClear && hasValue && !disabled ? (
              <button
                type="button"
                className="ant-datepicker-clear-btn"
                onClick={handleClear}
                aria-label="Clear date range"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            ) : (
              <CalendarIcon className="w-4 h-4 text-muted-foreground" />
            )}
          </span>
        </div>

        {isOpen && (
          <div className="ant-datepicker-dropdown">
            <Calendar
              value={rangeValue[0]}
              onChange={() => {}}
              disabledDate={disabledDate}
              locale={locale}
              onClose={() => setIsOpen(false)}
              rangeValue={rangeValue}
              onRangeChange={handleRangeChange}
              isRangePicker={true}
            />
          </div>
        )}
      </div>
    );
  }
);

RangePicker.displayName = "RangePicker";

export default DatePicker;
