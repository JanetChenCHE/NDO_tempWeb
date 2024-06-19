
import { DropDownMenu } from './js/forHTML/dropDownMenu.js';
import { ATTENDANCE_LOADFILE } from './js/loadFile/attendance.js';
import { LINECHART_ATT_GENDER } from './js/d3/lineChart_att_gender.js';
import { LINECHART_ATT } from './js/d3/lineChart_att.js';

//object 
const object_linechart_att_gender = new LINECHART_ATT_GENDER();
const object_linechart_att = new LINECHART_ATT();

const first = {cohort: 1, year: 2022};
const currentYear = new Date().getFullYear();
const difference = currentYear - first.year;
const cohort_current = first.cohort + difference;


const loadAndParseCSV = (fileName) => {
    return new Promise((resolve, reject) => {
        try {
            const obj = new ATTENDANCE_LOADFILE();
            obj.loadNparseCSV(fileName, () => {
                resolve(obj.objectData_year_month);
            });
        } catch (error) {
            reject(`Error loading or parsing CSV file ${fileName}: ${error}`);
        }
    });
};

// If the attendance record file is store as every year, this code is functionable
// ELSE, dont use this code
let a;
let allFileName_att = [];
let yearFile = currentYear;
for(let i = 0; i <5; i++) {
    if(yearFile >=2022) {
        const fileName = `./datasets_csv/Nicol_David_Organisation_${yearFile}.csv`;
        allFileName_att.push(fileName);
        yearFile--;
    }
}
// console.log(allFileName_att);
// const allFileName_att = ['./datasets_csv/Nicol_David_Organisation_1.csv', './datasets_csv/Nicol_David_Organisation_2.csv'];

let combinedData = [];
const loadAllFiles = async () => {
    for (const fileName of allFileName_att) {
        try {
            const data = await loadAndParseCSV(fileName);
            combinedData.push(...(data || []));
        } catch (error) {
            console.error(error);
        }
    }
};

// Populate the dropdown Menu in "html"
// Call the async function and populate the class in attendance dashboard
loadAllFiles().then(() => {
    const object_dropDownMenu = new DropDownMenu();
    object_dropDownMenu.populateSelection('classSelect_att', combinedData, 'class');
});


// Generate Chart
function generateChart(selectedYear, selectedClass){
    loadAllFiles().then(() => {
        processDataAndGenerateReports_gender(combinedData, selectedYear);
        processDataAndGenerateReports_class(combinedData, selectedYear, selectedClass);
    });
}

export function generateChart_StudentPerformacneDashboard(selectedYear, selectedStudent) {
    loadAllFiles().then(() => {
        processDataAndGenerateReports_SPECIFICstudent(combinedData, selectedYear, selectedStudent);
    });
}

export function generateChart_TeacherPerformacneDashboard(selectedYear, selectedteacher, studentName_array){
    loadAllFiles().then(() => {
        processDataAndGenerateReports_student(combinedData, selectedYear, selectedteacher, studentName_array);
    });
}

function processDataAndGenerateReports_gender(data, selectedYear) {
    // Data cleaning
    const newDataArray = data;

    // MONTHLY REPORT
    //GENDER
    // Define a new array to store the monthly averages
    const monthlyAverages = [];

    // Define the months
    const months = ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12'];

    // Iterate through each month
    months.forEach(month => {
        // Define variables to store counts and sums for each gender for the current month
        let maleCount = 0;
        let maleSum = 0;
        let femaleCount = 0;
        let femaleSum = 0;

        // Iterate through newDataArray to calculate counts and sums for the current month and gender
        newDataArray.forEach(row => {
            if (row.year === selectedYear && row.month === month && row.schoolDays !== 0) {
                if (row.gender.toUpperCase().trim() === 'MALE') {
                    maleCount++;
                    maleSum += parseFloat(row.presenceRate);
                } else if (row.gender.toUpperCase().trim() === 'FEMALE' && row.schoolDays !== 0) {
                    femaleCount++;
                    femaleSum += parseFloat(row.presenceRate);
                }
            }
        });

        // Calculate average presence rate for males and females
        const maleAverage = maleCount > 0 ? maleSum / maleCount : 0;
        const femaleAverage = femaleCount > 0 ? femaleSum / femaleCount : 0;

        // Push the monthly averages to the new array
        monthlyAverages.push([month, 'MALE', Number(maleAverage.toFixed(2))]);
        monthlyAverages.push([month, 'FEMALE', Number(femaleAverage.toFixed(2))]);
    });

    // make chart
    object_linechart_att_gender.loadLineChart(monthlyAverages);

}

function processDataAndGenerateReports_class(data, selectedYear, selectedClass) {
    // Data cleaning
    const newDataArray = data;

    //MONTHLY
    // Define a new array to store the monthly averages by class
    const monthlyAveragesByClass = [];

    // Get unique class names
    const uniqueClasses = [...new Set(newDataArray.map(item => item.class))];

    // Iterate through each unique class
    uniqueClasses.forEach(className => {
        // Define an object to store counts and sums for each month for the current class
        const classData = {};

        // Initialize counts and sums to 0 for each month
        for (let month = 1; month <= 12; month++) {
            classData[month] = { schoolDays: 0, presentCount: 0 };
        }

        // Iterate through newDataArray to calculate counts and sums for each month for the current class
        newDataArray.forEach(row => {
            if (row.year === selectedYear && row.class === className) {
                classData[parseInt(row.month)].schoolDays += row.schoolDays;
                classData[parseInt(row.month)].presentCount += row.presentCount;
            }
        });

        // Calculate average presence rate for each month for the current class
        for (let month = 1; month <= 12; month++) {
            const presenceRate = classData[month].schoolDays === 0 ? 0 : (classData[month].presentCount / classData[month].schoolDays) * 100;
            monthlyAveragesByClass.push({
                month: month.toString(),
                class: className,
                presenceRate: Number(presenceRate.toFixed(2))
            });
        }
    });

    // Filter monthlyAveragesByClass to find the data for the selected class
    const selectedClassAverages = monthlyAveragesByClass.filter((item) => item.class.toUpperCase().trim() === selectedClass);

    // Initialize 2D array to store the result
    const resultArray = [];

    // Iterate through selectedClassAverages and push values into resultArray
    selectedClassAverages.forEach(item => {
        resultArray.push([item.month, item.class, item.presenceRate]);
    });

    // Output the filtered data
    object_linechart_att.loadLineChart(resultArray, '#line_chart_att_class');
}

function processDataAndGenerateReports_student(data, selectedYear, selectedteacher, array_student) {
    // Data cleaning
    const newDataArray = data;

    //MONTHLY
    // Define a new array to store the monthly averages by student
    const monthlyAveragesByStudent = [];

    // Get unique student names
    const uniqueNames = [...new Set(newDataArray.map(item => item.name))];

    // Iterate through each unique name
    uniqueNames.forEach(studentName => {
        // Define an object to store counts and sums for each month for the current student
        const studentData = {};

        // Initialize counts and sums to 0 for each month
        for (let month = 1; month <= 12; month++) {
            studentData[month] = { schoolDays: 0, presentCount: 0 };
        }

        // Iterate through newDataArray to calculate counts and sums for each month for the current student
        newDataArray.forEach(row => {
            if (row.year === selectedYear && row.name === studentName) {
                studentData[parseInt(row.month)].schoolDays += row.schoolDays;
                studentData[parseInt(row.month)].presentCount += row.presentCount;
            }
        });

        // Calculate average presence rate for each month for the current student
        for (let month = 1; month <= 12; month++) {
            const presenceRate = studentData[month].schoolDays === 0 ? 0 : (studentData[month].presentCount / studentData[month].schoolDays) * 100;
            monthlyAveragesByStudent.push({
                month: month.toString(),
                name: studentName,
                presenceRate: Number(presenceRate.toFixed(2))
            });
        }
    });

    //DIFFERENTTTTTTTTTTTTTT
//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

    // Filter monthlyAveragesByStudent to find the data for the selected student
    const selectedStudentAverages = monthlyAveragesByStudent.filter((item) => {
        // Check if the name exists in array_student
        if (array_student.includes(item.name.toUpperCase().trim())) {
            return true; // Include if the name is in array_student
        }
        return false; // Exclude if the name is not in array_student
    });


    // Initialize an object to store counts and sums for each month for the selected student
    const monthlyCounts = {};
    const monthlySums = {};

    // Initialize counts and sums to 0 for each month
    for (let month = 1; month <= 12; month++) {
        monthlyCounts[month] = 0;
        monthlySums[month] = 0;
    }

    // Iterate through selectedStudentAverages to calculate counts and sums for each month
    selectedStudentAverages.forEach(item => {
        const month = parseInt(item.month);
        monthlyCounts[month]++;
        monthlySums[month] += item.presenceRate;
    });

    // Initialize an array to store the average presence rate for each month
    const averagePresenceRates = [];

    // Calculate the average presence rate for each month
    for (let month = 1; month <= 12; month++) {
        const count = monthlyCounts[month];
        const sum = monthlySums[month];
        const average = count === 0 ? 0 : sum / count;
        averagePresenceRates.push({
            month: month.toString(),
            name: selectedteacher,
            presenceRate: Number(average.toFixed(2))
        });
    }
//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

    // Initialize 2D array to store the result
    const resultArray = [];

    // Iterate through selectedStudentAverages and push values into resultArray
    averagePresenceRates.forEach(item => {
        resultArray.push([item.month, item.name, item.presenceRate]);
    });

    // Output the filtered data
    object_linechart_att.loadLineChart(resultArray, '#line_chart_att_teacher');
}

function processDataAndGenerateReports_SPECIFICstudent(data, selectedYear, selectedStudent) {
    // Data cleaning
    const newDataArray = data;

    //MONTHLY
    // Define a new array to store the monthly averages by student
    const monthlyAveragesByStudent = [];

    // Get unique student names
    const uniqueNames = [...new Set(newDataArray.map(item => item.name))];

    // Iterate through each unique name
    uniqueNames.forEach(studentName => {
        // Define an object to store counts and sums for each month for the current student
        const studentData = {};

        // Initialize counts and sums to 0 for each month
        for (let month = 1; month <= 12; month++) {
            studentData[month] = { schoolDays: 0, presentCount: 0 };
        }

        // Iterate through newDataArray to calculate counts and sums for each month for the current student
        newDataArray.forEach(row => {
            if (row.year === selectedYear && row.name === studentName) {
                studentData[parseInt(row.month)].schoolDays += row.schoolDays;
                studentData[parseInt(row.month)].presentCount += row.presentCount;
            }
        });

        // Calculate average presence rate for each month for the current student
        for (let month = 1; month <= 12; month++) {
            const presenceRate = studentData[month].schoolDays === 0 ? 0 : (studentData[month].presentCount / studentData[month].schoolDays) * 100;
            monthlyAveragesByStudent.push({
                month: month.toString(),
                name: studentName,
                presenceRate: Number(presenceRate.toFixed(2))
            });
        }
    });

    // Filter monthlyAveragesByStudent to find the data for the selected student
    const selectedStudentAverages = monthlyAveragesByStudent.filter((item) => item.name.toUpperCase().trim() === selectedStudent);

    // Initialize 2D array to store the result
    const resultArray = [];

    // Iterate through selectedStudentAverages and push values into resultArray
    selectedStudentAverages.forEach(item => {
        resultArray.push([item.month, item.name, item.presenceRate]);
    });

    // Output the filtered data
    object_linechart_att.loadLineChart(resultArray, '#line_chart_att_student');
}

function deleteCurrentChart() {
    object_linechart_att_gender.deleteLineChart();
    object_linechart_att.deleteLineChart('#line_chart_att_class');
}

function update() {
    // Delete current shown graphs
    deleteCurrentChart();

    const selectedYear1 = document.getElementById('year_att_gender').value;
    const selectedClass = document.getElementById('classSelect_att').value;

    // Call the function to generate the chart
    generateChart(selectedYear1, selectedClass);

}

// Call function on page load
document.addEventListener('DOMContentLoaded', function() {
    
    // Call updateDashboard when the selectors change
    document.getElementById('year_att_gender').addEventListener('change', update);
    document.getElementById('classSelect_att').addEventListener('change', update);

    update();
});
    