import { useState } from "react";

const MONTHS = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
];

const DAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

function Calendar({ onClose }) {
    const today = new Date();
    const [month, setMonth] = useState(today.getMonth());
    const [year, setYear] = useState(today.getFullYear());

    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const prevMonth = () => {
        if (month === 0) { setMonth(11); setYear(y => y - 1); }
        else setMonth(m => m - 1);
    };

    const nextMonth = () => {
        if (month === 11) { setMonth(0); setYear(y => y + 1); }
        else setMonth(m => m + 1);
    };

    const goToday = () => {
        setMonth(today.getMonth());
        setYear(today.getFullYear());
    };

    const isToday = (day) =>
        day === today.getDate() &&
        month === today.getMonth() &&
        year === today.getFullYear();

    const cells = [];
    for (let i = 0; i < firstDay; i++) {
        cells.push(<div key={`empty-${i}`} className="cal-cell empty" />);
    }
    for (let d = 1; d <= daysInMonth; d++) {
        cells.push(
            <div
                key={d}
                className={`cal-cell ${isToday(d) ? "today" : ""}`}
            >
                {d}
            </div>
        );
    }

    return (
        <div className="calendar-overlay" onClick={onClose}>
            <div className="calendar" onClick={e => e.stopPropagation()}>
                <div className="cal-header">
                    <button className="cal-nav" onClick={prevMonth}>‹</button>
                    <button className="cal-title" onClick={goToday}>
                        {MONTHS[month]} {year}
                    </button>
                    <button className="cal-nav" onClick={nextMonth}>›</button>
                </div>

                <div className="cal-days">
                    {DAYS.map(d => (
                        <div key={d} className="cal-day-name">{d}</div>
                    ))}
                </div>

                <div className="cal-grid">
                    {cells}
                </div>
            </div>
        </div>
    );
}

export default Calendar;
