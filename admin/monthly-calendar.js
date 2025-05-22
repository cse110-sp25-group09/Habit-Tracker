const calendarContainer = document.getElementById('calendar');
const monthLabel = document.getElementById('month-label');
let currentYear = new Date().getFullYear();


const monthNames = [
 'January', 'February', 'March', 'April', 'May', 'June',
 'July', 'August', 'September', 'October', 'November', 'December'
];


function generateCalendar(year) {
 calendarContainer.innerHTML = '';
 monthLabel.textContent = year;


 for (let month = 0; month < 12; month++) {
   const monthDiv = document.createElement('div');
   monthDiv.className = 'month';


   const title = document.createElement('div');
   title.className = 'month-label';
   title.textContent = `${monthNames[month]} ${year}`;
   monthDiv.appendChild(title);


   const grid = document.createElement('div');
   grid.className = 'calendar-grid';


  
   ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].forEach(day => {
     const dayHeader = document.createElement('div');
     dayHeader.className = 'day-header';
     dayHeader.textContent = day;
     grid.appendChild(dayHeader);
   });


   // Date logic
   const firstDay = new Date(year, month, 1).getDay();
   const daysInMonth = new Date(year, month + 1, 0).getDate();
   const prevMonthDays = new Date(year, month, 0).getDate();


   // Fill overflow from previous month
   for (let i = 0; i < firstDay; i++) {
     const overflow = document.createElement('div');
     overflow.className = 'day inactive';
     overflow.textContent = prevMonthDays - firstDay + 1 + i;
     grid.appendChild(overflow);
   }


   // Fill current month
   for (let day = 1; day <= daysInMonth; day++) {
     const dayDiv = document.createElement('div');
     dayDiv.className = 'day';
     dayDiv.textContent = day;
     grid.appendChild(dayDiv);
   }


   // Fill remaining cells with next month overflow to make full 6 rows (if needed)
   const totalCells = grid.children.length;
   const totalNeeded = 7 * 6; // 7 days x 6 rows
   for (let i = totalCells; i < totalNeeded; i++) {
     const overflow = document.createElement('div');
     overflow.className = 'day inactive';
     overflow.textContent = i - totalCells + 1;
     grid.appendChild(overflow);
   }


   monthDiv.appendChild(grid);
   calendarContainer.appendChild(monthDiv);
 }
}


document.getElementById('prev-year').addEventListener('click', () => {
 currentYear--;
 generateCalendar(currentYear);
});


document.getElementById('next-year').addEventListener('click', () => {
 currentYear++;
 generateCalendar(currentYear);
});


generateCalendar(currentYear);
