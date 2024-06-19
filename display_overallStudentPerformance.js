
import { DATABASE_LOADFILE } from './js/loadFile/database.js';
import { DATA_LOADFILE } from './js/loadFile/data.js';
import { ATTENDANCE_LOADFILE } from './js/loadFile/attendance.js';
import { DONUTCHART_CLASSSTUDENTCOUNT } from './js/d3/donutChart_classStudentCount.js';
import { DONUTCHART_AVERAGEMARK } from './js/d3/donutChart_averageMark.js';
import { BARCHART_KPI } from './js/d3/barChart_KPI.js';
import { COHORTYEAR } from './js/analysis/cohort_year.js';

// const firstCohort = 1;
// const firstYear = 2022;
// const first = {cohort: 1, year: 2022};
// const currentYear = new Date().getFullYear();

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
let b;
// ----- !!!!! WARNING !!!!! ----- //
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
    combinedData = removeDuplicates(combinedData);
    // console.log(combinedData);
};

const removeDuplicates = (arr) => {
    const uniqueArray = [];
    arr.forEach(item => {
        if (!uniqueArray.some(uniqueItem => areObjectsEqual(uniqueItem, item))) {
            uniqueArray.push(item);
        }
    });
    return uniqueArray;
};

const areObjectsEqual = (obj1, obj2) => {
    const keys1 = Object.keys(obj1);
    const keys2 = Object.keys(obj2);
    if (keys1.length !== keys2.length) {
        return false;
    }
    for (let key of keys1) {
        if (obj1[key] !== obj2[key]) {
            return false;
        }
    }
    return true;
};

// Button on the donut chart for total student
const button = document.getElementById('genderButton');
const states = ['Default', 'Male', 'Female'];
const colors = ['grey', '#89CFF0', '#F4C2C2'];
let currentIndex = 0;

function getButtonState() {
    return states[currentIndex];
}

// object
const object_find_cohort_start_and_end = new COHORTYEAR();

const toProperCase = (str) => {
    return str.toLowerCase().replace(/(?:^|\s|\/)\w/g, (match) => {
        return match.toUpperCase();
    });
};

function calculation_averageAtt(data, year) {
    let temp_row = 0;
    let count_row = 0;
    let temp = 0;
    let count = 0;
    let prevName = '';
    let currentName = '';

    for(let i=0; i<data.length; i++) {
        currentName = data[i].name;
        if(prevName === '') {
            prevName = currentName;
        }
        const value = data[i].year;
        if(value === year) {
            if(prevName === currentName) {
                const rate = data[i].presenceRate;
                temp_row += rate;
                count_row++;
            }
            else if(currentName !== prevName) {
                prevName = currentName;
                temp_row = temp_row / count_row;
                temp += temp_row;
                count++;
                // Initialise
                temp_row = 0;
                count_row = 0;
                // Calculation
                const rate = data[i].presenceRate;
                temp_row += rate;
                count_row++;
            }
        }
    }
    temp = temp / count;
    const output = Number(temp.toFixed(2));
    return output;
}

function calculation_averageAtt_eachStudent(data, year) {
    let temp_row = 0;
    let count_row = 0;
    let prevName = '';
    let currentName = '';
    let prevName_cohort = '';
    let currentName_cohort = '';
    let array_averageRate_eachStudent = [];

    for (let i = 0; i < data.length; i++) {
        currentName = data[i].name;
        currentName_cohort = data[i].class;
        if (prevName === '') {
            prevName = currentName;
            prevName_cohort = currentName_cohort;
        }
        const value = data[i].year;
        if (value === year) {
            if (currentName !== prevName) {
                if (count_row > 0) {
                    temp_row = Number((temp_row / count_row).toFixed(2));
                    array_averageRate_eachStudent.push({ 'name': prevName, 'cohort': prevName_cohort, 'presenceRate': temp_row });
                }
                // Change to next student
                prevName = currentName;
                prevName_cohort = currentName_cohort;
                // Initialise
                temp_row = 0;
                count_row = 0;
            }
            // Calculation
            const rate = data[i].presenceRate;
            temp_row += rate;
            count_row++;
        }
    }
    
    // Handle last student
    if (count_row > 0) {
        temp_row = Number((temp_row / count_row).toFixed(2));
        array_averageRate_eachStudent.push({ 'name': prevName, 'cohort': prevName_cohort, 'presenceRate': temp_row });
    }

    return array_averageRate_eachStudent;
}

function calculation_averageKPI(data, measurement) {
    let total = 0;
    let count = 0;
    for(let i=0; i<data.length; i++) {
        const scores = data[i].scores;
        let total_row = 0;
        let count_row = 0;
        // Each Row
        for(let j=0; j<scores.length; j++) {
            const key = Object.keys(scores[j]);
            const value = Object.values(scores[j]);
            if(key[0] === measurement && !isNaN(value[0]) && value[0]!==0) {
                total_row += value[0];
                count_row++;
            }
        }
        total_row = total_row / count_row;
        if(!isNaN(total_row)) {
            total += total_row;
        }
        count++;
    }
    const ave = total / count;
    return ave;
}

function calculation_averageKPI_eachStudent(data, measurement) {
    let newArray = [];

    for(let i=0; i<data.length; i++) {
        const name = data[i].name;
        const scores = data[i].scores;
        let total_row = 0;
        let count_row = 0;
        // Each Row
        for(let j=0; j<scores.length; j++) {
            const key = Object.keys(scores[j]);
            const value = Object.values(scores[j]);
            if(key[0] === measurement && !isNaN(value[0]) && value[0]!==0) {
                total_row += value[0];
                count_row++;
            }
        }
        total_row = total_row / count_row;
        newArray.push({'name': name,  'OS': total_row});
    }
    return newArray;
}

function calculation_totalStudent_class(data, className) {
    let total = 0; 
    const formattedClassName = className.toLowerCase().trim().replace(/\s+/g, ' ');

    for(let i = 0; i < data.length; i++) {
        const current_cohort = data[i].class.toLowerCase().trim();
        
        // Normalize the cohort class name to match the format
        const classParts = current_cohort.split(':');
        const classPrefix = classParts[0].trim();
        const classNamePart = classParts[1] ? classParts[1].trim() : '';

        // Check if any part of the class name matches
        const classMatch = `${classPrefix} ${classNamePart}`.toLowerCase().replace(/\s+/g, ' ');

        // Check if the formattedClassName is included in classMatch
        if (classMatch.includes(formattedClassName)) {
            total++;
        }
    }
    
    return total;
}


function getHIGHESTAverageKPIs_student(chosenYear, chosenCohort, programme, callback) {
    const object_data_loadfile = new DATA_LOADFILE();
    const fileName = `./datasets_csv/KPI_(C${chosenCohort})_${chosenYear}_${programme}_KPIs.csv`;

    object_data_loadfile.loadNparseCSV(fileName, chosenYear, () => {
        const data = object_data_loadfile.objectData;
        const student_aveKPI = calculation_averageKPI_eachStudent(data, 'OS');
        let highestmark = 0;
        for(let i = 0; i < student_aveKPI.length; i++) {
            const mark = student_aveKPI[i].OS;
            if(highestmark < mark) {
                highestmark = mark;
            }
        }

        let getHIGHESTmark_student_array = [];
        for(let i = 0; i < student_aveKPI.length; i++) {
            const name = student_aveKPI[i].name;
            const mark = student_aveKPI[i].OS;
            if(highestmark === mark) {
                getHIGHESTmark_student_array.push({'name': name, 'OS': mark});
            }
        }
        callback(getHIGHESTmark_student_array);
    });
}

function getMOSTImproveAverageKPIs_student(chosenYear, chosenCohort, programme, callback) {

    const prevYear = chosenYear - 1;

    let difference_between_twoYEAR = [];

    const object_data_loadfile_prev = new DATA_LOADFILE();
    const object_data_loadfile_current = new DATA_LOADFILE();
    const current_fileName = `./datasets_csv/KPI_(C${chosenCohort})_${chosenYear}_${programme}_KPIs.csv`;
    const prev_fileName = `./datasets_csv/KPI_(C${chosenCohort})_${chosenYear-1}_${programme}_KPIs.csv`;

    object_data_loadfile_current.loadNparseCSV(current_fileName, chosenYear, () => {
        const data_current = object_data_loadfile_current.objectData;
        object_data_loadfile_prev.loadNparseCSV(prev_fileName, prevYear, () => {
            const data_prev = object_data_loadfile_prev.objectData;

            // Get the data for chosen year and previous year (for further comparison)
            const currentYear_students_aveKPI = calculation_averageKPI_eachStudent(data_current, 'OS');
            const prevYear_students_aveKPI = calculation_averageKPI_eachStudent(data_prev, 'OS');

            // Get the difference value between current and previous year
            for(let i=0; i<currentYear_students_aveKPI.length; i++) {
                const name_current = currentYear_students_aveKPI[i].name;
                const mark_current = currentYear_students_aveKPI[i].OS;
                for(let j=0; j<prevYear_students_aveKPI.length; j++) {
                    const name_prev = prevYear_students_aveKPI[j].name;
                    const mark_prev = prevYear_students_aveKPI[j].OS;
                    if(name_prev === name_current) {
                        const difference = mark_current - mark_prev;
                        difference_between_twoYEAR.push({'name': name_current, 'OS': difference, 'oriMark': mark_current});
                    }
                }
            }

            // Get the most improve student name
            let mostImproveMark = 0;
            for(let i=0; i<difference_between_twoYEAR.length; i++) {
                const mark = difference_between_twoYEAR[i].OS;
                if(mostImproveMark < mark) {
                    mostImproveMark = mark;
                }
            }

            // Get most improve student in KPI
            let mostImproveStudent_array = [];
            for(let i=0; i<difference_between_twoYEAR.length; i++) {
                const name = difference_between_twoYEAR[i].name;
                const mark = difference_between_twoYEAR[i].OS;
                const mark_thisYear = difference_between_twoYEAR[i].oriMark;
                if(mark === mostImproveMark) {
                    mostImproveStudent_array.push({'name': name, 'OS': mark_thisYear});
                }
            }

            callback(mostImproveStudent_array);
        });
    });

}

function totalStudent(chosenYear) {
    loadAllFiles().then(() => {
        let recordedName_inAttendance = [];
            let filtered_data_attendance = [];
            for(let i=0; i<combinedData.length; i++) {
                const recordName = recordedName_inAttendance.find(student => student === combinedData[i].name);
                if(combinedData[i].year === chosenYear && !recordName) {
                    filtered_data_attendance.push(combinedData[i]);
                    recordedName_inAttendance.push(combinedData[i].name);
                }
            }
            const total = filtered_data_attendance.length;
            document.getElementById('totalStudent').innerHTML = total;
    });
}

function averageAttendance(chosenYear, chosenCohort) {
    const year = chosenYear.toString();

    loadAllFiles().then(() => {
        // Total Presence Rate
        const output =calculation_averageAtt(combinedData, year);
        document.getElementById('totalPresenceRate').innerHTML = output + '%';

        // Change of presence rate
        const cohort = `COHORT${chosenCohort}`;
        const start_end_year = object_find_cohort_start_and_end.cohort_startyear_endyear(cohort);
        const startYear_cohort = start_end_year.start;

        const prevyear = (Number(year) - 1).toString();
        // filter data
        let filtered_data_attendance = [];
        for(let i=0; i<combinedData.length; i++) {
            const className = combinedData[i].class;
            if(className.startsWith(`C${chosenCohort}`)) {
                filtered_data_attendance.push(combinedData[i]);
            }
        }
        const chosenYear_output = calculation_averageAtt(filtered_data_attendance, year);

        if(prevyear >= startYear_cohort) {
            const prev_output = calculation_averageAtt(filtered_data_attendance, prevyear);
            const changes = ((Number(chosenYear_output) - Number(prev_output)).toFixed(2)).toString();
            let arrow;
            if(changes < 0) {
                arrow = './img/decrease.png';
            }
            else if(changes > 0) {
                arrow = './img/increase.png';
            }
            else if(changes === 0) {
                arrow = './img/remain.png';
            }
            const display = `
            <div class="summary_number_arrow">
                <p>${chosenYear_output}%</p>
                <img src="${arrow}" class="genderIcon">
            </div>
            `;
            document.getElementById('changePresenceRate').innerHTML = display;
        }
        else if(Number(chosenYear) === startYear_cohort) {
            document.getElementById('changePresenceRate').innerHTML = chosenYear_output;
        }
        else {
            // document.getElementById('changePresenceRate').innerHTML =  'First year of NDO';
        }
    });
}

function change_numberOFstudent(chosenYear, chosenCohort) {
    const prevYear = chosenYear - 1;
    
    const cohort = `COHORT${chosenCohort}`;
    const start_end_year = object_find_cohort_start_and_end.cohort_startyear_endyear(cohort);
    const startYear_cohort = start_end_year.start;

    loadAllFiles().then(() => {
        let recordedName_inAttendance = [];
            let filtered_data_attendance_chosenYear = [];
            for(let i=0; i<combinedData.length; i++) {
                const recordName = recordedName_inAttendance.find(student => student === combinedData[i].name);
                if(combinedData[i].year === chosenYear && !recordName && combinedData[i].class.startsWith(`C${chosenCohort}`)) {
                    filtered_data_attendance_chosenYear.push(combinedData[i]);
                    recordedName_inAttendance.push(combinedData[i].name);
                }
            }
            recordedName_inAttendance = [];
            let filtered_data_attendance_prevYear = [];
            for(let i=0; i<combinedData.length; i++) {
                const recordName = recordedName_inAttendance.find(student => student === combinedData[i].name);
                if(combinedData[i].year === prevYear && !recordName && combinedData[i].class.startsWith(`C${chosenCohort}`)) {
                    filtered_data_attendance_prevYear.push(combinedData[i]);
                    recordedName_inAttendance.push(combinedData[i].name);
                }
            }

            if(chosenYear > startYear_cohort) {
                const difference_between_twoYEAR = filtered_data_attendance_chosenYear.length - filtered_data_attendance_prevYear.length;
                let arrow;
                if(difference_between_twoYEAR < 0) {
                    arrow = './img/decrease.png';
                }
                else if(difference_between_twoYEAR > 0) {
                    arrow = './img/increase.png';
                }
                else if(difference_between_twoYEAR === 0) {
                    arrow = './img/remain.png';
                }
                const display = `
                <div class="summary_number_arrow">
                    <p>${filtered_data_attendance_chosenYear.length}</p>
                    <img src="${arrow}" class="genderIcon">
                </div>
                `;
                document.getElementById('changeNumberOfStudent').innerHTML =  display;
            }
            else if (Number(chosenYear) === startYear_cohort) {
                const display = filtered_data_attendance_chosenYear.length;
                document.getElementById('changeNumberOfStudent').innerHTML =  display;
            }
            else {
                // document.getElementById('changeNumberOfStudent').innerHTML =  'First year of NDO';
            }
    });
}

function change_KPI(chosenYear, chosenCohort, programme, id) {
    const prevYear = chosenYear - 1;
    
    const cohort = `COHORT${chosenCohort}`;
    const start_end_year = object_find_cohort_start_and_end.cohort_startyear_endyear(cohort);
    const startYear_cohort = start_end_year.start;

    const object1 = new DATA_LOADFILE();
    const object2 = new DATA_LOADFILE();
    object1.loadNparseCSV(`./datasets_csv/KPI_(C${chosenCohort})_${chosenYear}_${programme}_KPIs.csv`, chosenYear, () => {
        const data_chosenYear = object1.objectData;
        const ave_chosenYear = calculation_averageKPI(data_chosenYear, 'OS');

        // AverageScore - donut chart
        const max_value = 6;
        const remaining_value = max_value - ave_chosenYear;
        const chart_data = {'OS': ave_chosenYear, 'remain': remaining_value};
        const chartID = `#donutchart_${programme}KPIs`;
        let chartColour;
        if(programme === 'English') {
            chartColour = '#262759';
        }
        else {
            chartColour = '#ff9c20';
        }
        chart_averageScore(chart_data, programme, chartID, chartColour);

        if(prevYear >= startYear_cohort) {
            object2.loadNparseCSV(`./datasets_csv/KPI_(C${chosenCohort})_${prevYear}_${programme}_KPIs.csv`, prevYear, () => {
    
                // Card - difference between chosen year and previous year in KPI
                const data_prevYear = object2.objectData;
    
                const ave_prevYear = calculation_averageKPI(data_prevYear, 'OS');
    
                const difference = (ave_chosenYear - ave_prevYear).toFixed(2);
                let arrow;
                if(difference < 0) {
                    arrow = './img/decrease.png';
                }
                else if(difference > 0) {
                    arrow = './img/increase.png';
                }
                else if(difference === 0) {
                    arrow = './img/remain.png';
                }
                const display = `
                <div class="summary_number_arrow">
                    <p>${ave_chosenYear.toFixed(2)}</p>
                    <img src="${arrow}" class="genderIcon">
                </div>
                `;
                document.getElementById(id).innerHTML =  display;
            });
        }
        else if(Number(chosenYear) === startYear_cohort) {
            document.getElementById(id).innerHTML =  ave_chosenYear.toFixed(2);
        }
        else {}
    });
}

function bestStudent(chosenYear, chosenCohort, programme) {
    getHIGHESTAverageKPIs_student(chosenYear, chosenCohort, programme, (array_studentName) => {
        const id = `bestKPIin${programme}`;
        const array = array_studentName;
        for(let i=0; i<array.length; i++) {
            const name = toProperCase(array[i].name);
            const mark = (array[i].OS).toFixed(2) + " %";
            document.getElementById(id).innerHTML = `
            <img src="./img/samplePic.jpg" class="student-card-pic_highlight">
            <div class="student-card-info_highlight">
                <p class="name"; style="color: #969695;">${name}</p>
                <hr>
                <p class="mark"; style="font-size: 20px; font-weight: bold">${mark}</p>
            </div>
        `;
        }
    });
}

function mostImprovedStudent(chosenYear, chosenCohort, programme) {

    const id = `mostImproveKPIin${programme}`;

    const cohort = `COHORT${chosenCohort}`;
    const start_end_year = object_find_cohort_start_and_end.cohort_startyear_endyear(cohort);
    const startYear_cohort = start_end_year.start;

    const prevYear = chosenYear - 1;
    if(prevYear >= startYear_cohort) {
        getMOSTImproveAverageKPIs_student(chosenYear, chosenCohort, programme, (array_studentName) => {
            let htmlContent = '';

            for(let i = 0; i < array_studentName.length; i++) {
                const name = toProperCase(array_studentName[i].name);
                const mark = (array_studentName[i].OS).toFixed(2) + ' %';
                if (array_studentName[i] !== '') {
                    htmlContent += `
                        <img src="./img/samplePic.jpg" class="student-card-pic_highlight">
                        <div class="student-card-info_highlight">
                            <p class="name"; style="color: #969695;">${name}</p>
                            <hr>
                            <p class="mark"; style="font-size: 20px; font-weight: bold">${mark}</p>
                        </div>
                    `;
                }
            }
            if (htmlContent === '') {
                htmlContent = `
                    <img src="./img/samplePic.jpg" class="student-card-pic_highlight">
                    <div class="student-card-info_highlight">
                        <p class="name"; style="color: #969695;">???</p>
                        <hr>
                        <p class="mark"; style="font-size: 20px; font-weight: bold">??? %</p>
                    </div>
                `;
            }
        document.getElementById(id).innerHTML = htmlContent;
        });
    }
    else {
        document.getElementById(id).innerHTML = 'This is the first year';
    }

}

function bestStudent_att(chosenYear, chosenCohort) {
    loadAllFiles().then(() => {
        const array = calculation_averageAtt_eachStudent(combinedData, chosenYear);

        // Get highest rate
        let highestRate = 0;
        for (let i = 0; i < array.length; i++) {
            const rate = array[i].presenceRate;
            const cohort = array[i].cohort;
            const cohortNum = cohort.match(/\d+/)[0];
            if (highestRate < rate && cohortNum === chosenCohort) {
                highestRate = rate;
            }
        }

        // Get highest rate student name
        let array_highestAtt_studentName = [];
        for (let i = 0; i < array.length; i++) {
            const name = array[i].name;
            const rate = array[i].presenceRate;
            const cohort = array[i].cohort;
            const cohortNum = cohort.match(/\d+/)[0];
            if (rate === highestRate && cohortNum === chosenCohort) {
                array_highestAtt_studentName.push({'name': name, 'presenceRate': rate});
            }
        }

        const bestStudentContainer = document.getElementById('bestStudent_inAttendance');
        bestStudentContainer.innerHTML = ''; // Clear previous content

        array_highestAtt_studentName.forEach(student => {
            const name = toProperCase(student.name);
            const rate = student.presenceRate.toFixed(0) + " %";
            bestStudentContainer.innerHTML += `
                <div class="student-card_highlight">
                    <img src="./img/samplePic.jpg" class="student-card-pic_highlight">
                    <div class="student-card-info_highlight">
                        <p class="name"; style="color: #969695;">${name}</p>
                        <hr>
                        <p class="rate"; style="font-size: 20px; font-weight: bold">${rate}</p>
                    </div>
                </div>
            `;
        });

        // Reset scroll position to the beginning
        bestStudentContainer.scrollLeft = 0;

        // Add scrolling functionality
        const scrollLeftButton = document.getElementById('scrollLeft');
        const scrollRightButton = document.getElementById('scrollRight');
        const cardWidth = 100;
        const scrollAmount = cardWidth;

        scrollLeftButton.addEventListener('click', () => {
            bestStudentContainer.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
        });

        scrollRightButton.addEventListener('click', () => {
            bestStudentContainer.scrollBy({ left: scrollAmount, behavior: 'smooth' });
        });
    });
}

function mostImprovedStudent_att(chosenYear, chosenCohort) {

    const cohort = `COHORT${chosenCohort}`;
    const start_end_year = object_find_cohort_start_and_end.cohort_startyear_endyear(cohort);
    const startYear_cohort = start_end_year.start;

    const prevYear = chosenYear - 1;
    if(prevYear >= startYear_cohort) {

        loadAllFiles().then(() => {
            const array_chosenYear = calculation_averageAtt_eachStudent(combinedData, chosenYear);
            const array_prevYear = calculation_averageAtt_eachStudent(combinedData, prevYear.toString());

            // Get all student present rate
            let array_DifferenceAttendance_studentName = [];
            for(let i=0; i<array_chosenYear.length; i++) {
                const name_chosenYear = array_chosenYear[i].name;
                const cohort_chosenYear = array_chosenYear[i].cohort;
                const cohortNum_chosenYear = cohort_chosenYear.match(/\d+/)[0];
                const rate_chosenYear = array_chosenYear[i].presenceRate;
                for(let j=0; j<array_prevYear.length; j++) {
                    const name_prevYear = array_prevYear[j].name;
                    const rate_prevYear = array_prevYear[j].presenceRate;

                    // Calculation
                    if(cohortNum_chosenYear === chosenCohort) {
                        if(name_chosenYear === name_prevYear) {
                            const difference = rate_chosenYear - rate_prevYear;
                            // push to new array
                            array_DifferenceAttendance_studentName.push({'name': name_chosenYear, 'presentRate': difference, 'ori_presentRate': rate_chosenYear});
                        }
                    }
                }
            }

            // get the highest difference
            let highestDifference = 0;
            for(let i=0; i<array_DifferenceAttendance_studentName.length; i++) {
                const rate = array_DifferenceAttendance_studentName[i].presentRate;
                if(highestDifference < rate) {
                    highestDifference = rate;
                }
            }

            // Get the most improve presence rate student Name
            let array_mostImproveAttendance_studentName = [];
            for(let i=0; i<array_DifferenceAttendance_studentName.length; i++) {
                const name = array_DifferenceAttendance_studentName[i].name;
                const rate = array_DifferenceAttendance_studentName[i].presentRate;
                const rate_thisYear = array_DifferenceAttendance_studentName[i].ori_presentRate;
                if(highestDifference === rate) {
                    array_mostImproveAttendance_studentName.push({'name': name, 'presentRate': rate_thisYear});
                }
            }
            
            for(let i=0; i<array_mostImproveAttendance_studentName.length; i++) {
                const name = toProperCase(array_mostImproveAttendance_studentName[i].name);
                const rate = (array_mostImproveAttendance_studentName[i].presentRate).toFixed(0) + " %";
                document.getElementById('mostImproveStudent_inAttendance').innerHTML = `
                    <img src="./img/samplePic.jpg" class="student-card-pic_highlight">
                    <div class="student-card-info_highlight">
                        <p class="name"; style="color: #969695;">${name}</p>
                        <hr>
                        <p class="rate"; style="font-size: 20px; font-weight: bold">${rate}</p>
                    </div>
                `;
            }
        });
    }
    else {
        document.getElementById('mostImproveStudent_inAttendance').innerHTML = 'This is the first year';
    }
}

function handleButtonClick(chosenYear, chosenCohort) {
    currentIndex = (currentIndex + 1) % states.length;
    button.textContent = states[currentIndex];
    button.style.backgroundColor = colors[currentIndex];
    const gender = getButtonState();
    // Regenerate chart based on updated gender state
    chart_classStudentCount(chosenYear, chosenCohort, gender);
}

function chart_classStudentCount(chosenYear, chosenCohort, selectedGender) {
    loadAllFiles().then(() => {
        let filtered_year = [];
        let filtered_cohort_year = [];
        for(let i=0; i<combinedData.length; i++) {
            if(combinedData[i].year === chosenYear) {
                // Check if the name is already in the filtered_year array
                const isNameDifferent = !filtered_year.some(item => item.name === combinedData[i].name);
                if(isNameDifferent) {
                    filtered_year.push(combinedData[i]);
                }
            }
            const cohort = combinedData[i].class;
            const cohortNumber = cohort.match(/\d+/)[0];
            if(cohortNumber === chosenCohort && combinedData[i].year === chosenYear) {
                // Check if the name is already in the filtered_cohort_year array
                const isNameDifferent = !filtered_cohort_year.some(item => item.name === combinedData[i].name);
                if(isNameDifferent) {
                    filtered_cohort_year.push(combinedData[i]);
                }
            }
        }

        let filtered_gender = [];
        for(let i=0; i<combinedData.length; i++) {
            if(combinedData[i].gender.toUpperCase() === selectedGender.toUpperCase()) {
                filtered_gender.push(combinedData[i]);
            }
            else if(selectedGender === 'Default') {
                filtered_gender.push(combinedData[i]);
            }
        }

        // Percentage will be shown centre of the donut chart
        let filtered_cohort_year_gender = [];
        for(let i=0; i<filtered_gender.length; i++) {
            const cohort = filtered_gender[i].class;
            const cohortNumber = cohort.match(/\d+/)[0];
            if(cohortNumber === chosenCohort && filtered_gender[i].year === chosenYear) {
                // Check if the name is already in the filtered_cohort_year_gender array
                const isNameDifferent = !filtered_cohort_year_gender.some(item => item.name === filtered_gender[i].name);
                if(isNameDifferent) {
                    filtered_cohort_year_gender.push(filtered_gender[i]);
                }
            }
        }
        
        const percentageStudent_cohort = (filtered_cohort_year.length / filtered_year.length) *100;
        const display_percentageStudent_cohort = percentageStudent_cohort.toFixed(2) + '%\nCohort ' + chosenCohort;

        // Calculation
        const happy_totalStudent = calculation_totalStudent_class(filtered_cohort_year_gender, 'Happy Cubs');
        const kind_totalStudent = calculation_totalStudent_class(filtered_cohort_year_gender, 'Kind Cubs');
        const strong_totalStudent = calculation_totalStudent_class(filtered_cohort_year_gender, 'Strong Cubs');

        const numberOFstudents_class = {
            'HappyCubs': happy_totalStudent,
            'KindCubs': kind_totalStudent,
            'StrongCubs': strong_totalStudent
        };

        // Chart
        const object_donutChart = new DONUTCHART_CLASSSTUDENTCOUNT();
        object_donutChart.loadDonutChart(numberOFstudents_class, display_percentageStudent_cohort);
        object_donutChart.loadBarChart(numberOFstudents_class);
    });
}


function chart_KPI(chosenYear, chosenCohort, programme, chartID) {
    let uniqueMeasurement = new Set();
    let measurement_with_value = [];

    const object_data_loadfile = new DATA_LOADFILE();
    const fileName = `./datasets_csv/KPI_(C${chosenCohort})_${chosenYear}_${programme}_KPIs.csv`;
    object_data_loadfile.loadNparseCSV(fileName, chosenYear, () => {
        const data = object_data_loadfile.objectData;
        
        // Get all measurements
        for(let i=0; i<data.length; i++) {
            const scores = data[i].scores;
            for(let j=0; j<scores.length; j++) {
                const key = Object.keys(scores[j]);
                if(key[0] != 'OS') {
                    uniqueMeasurement.add(key[0]);
                }
            }
        }
        const allMeasurement = [...uniqueMeasurement];
        
        // Calculation
        for(let i=0; i<allMeasurement.length; i++) {
            const measure = allMeasurement[i];
            const value = calculation_averageKPI(data, measure);
            measurement_with_value.push([measure, Number(value.toFixed(2))]);
        }
        
        // Chart
        const object_barchartKPI = new BARCHART_KPI();
        object_barchartKPI.loadBarChart(measurement_with_value, chartID);
    });
}

function chart_averageScore(data, percentage_text, chartID, colour) {
    const object_donutChart = new DONUTCHART_AVERAGEMARK();
    object_donutChart.loadDonutChart(data, percentage_text, chartID, colour);
}

// DISPLAY
function cleanDashboard() {
    document.getElementById('totalStudent').innerHTML = '';
    document.getElementById('totalPresenceRate').innerHTML = '';
    document.getElementById('changePresenceRate').innerHTML = '';
    document.getElementById('changeNumberOfStudent').innerHTML =  '';
    document.getElementById('changeEnglishKPI').innerHTML =  '';
    document.getElementById('changeSquashKPI').innerHTML =  '';
    document.getElementById('bestKPIinEnglish').innerHTML =  '';
    document.getElementById('bestKPIinSquash').innerHTML =  '';
    document.getElementById('mostImproveKPIinEnglish').innerHTML =  '';
    document.getElementById('mostImproveKPIinSquash').innerHTML =  '';
    document.getElementById('mostImproveStudent_inAttendance').innerHTML =  '';
    document.getElementById('studentCardsContainer').innerHTML = '';
    d3.select('#donutchart_classStudentCount svg').remove();
    d3.select('#barchart_EnglishKPIs svg').remove();
    d3.select('#barchart_SquashKPIs svg').remove();
    d3.select('#donutchart_EnglishKPIs svg').remove();
    d3.select('#donutchart_SquashKPIs svg').remove();
}

function updateDashboard() {
    cleanDashboard();
    const selectedYear = document.getElementById('select-year').value;
    const selectedCohort = document.getElementById('select-cohort').value;

    
    showStudentInformation_card(selectedCohort);
    totalStudent(selectedYear);
    averageAttendance(selectedYear, selectedCohort);
    change_numberOFstudent(selectedYear, selectedCohort);
    change_KPI(selectedYear, selectedCohort, 'English', 'changeEnglishKPI');
    change_KPI(selectedYear, selectedCohort, 'Squash', 'changeSquashKPI');
    handleButtonClick(selectedYear, selectedCohort);
    button.addEventListener('click', () => {
        handleButtonClick(selectedYear, selectedCohort);
    });
    chart_KPI(selectedYear, selectedCohort, 'English', '#barchart_EnglishKPIs');
    chart_KPI(selectedYear, selectedCohort, 'Squash', '#barchart_SquashKPIs');
    bestStudent(selectedYear, selectedCohort, 'English');
    bestStudent(selectedYear, selectedCohort, 'Squash');
    mostImprovedStudent(selectedYear, selectedCohort, 'English');
    mostImprovedStudent(selectedYear, selectedCohort, 'Squash');
    bestStudent_att(selectedYear, selectedCohort);
    mostImprovedStudent_att(selectedYear, selectedCohort);
}

function showStudentInformation_card(chosenCohort) {
    // Container button - left "<", right ">"
    const container = document.getElementById('studentCardsContainer');
    const leftButton = document.querySelector('.navigation-button.left');
    const rightButton = document.querySelector('.navigation-button.right');
    const cardsPerScroll = 3;

    leftButton.addEventListener('click', () => {
        const containerWidth = container.clientWidth;
        const cardWidth = containerWidth / cardsPerScroll;
        container.scrollBy({
            left: -cardWidth,
            behavior: 'smooth'
        });
    });

    rightButton.addEventListener('click', () => {
        const containerWidth = container.clientWidth;
        const cardWidth = containerWidth / cardsPerScroll;
        container.scrollBy({
            left: cardWidth,
            behavior: 'smooth'
        });
    });


    // Display
    // extract data
    const object_database_loadfile = new DATABASE_LOADFILE();
    object_database_loadfile.loadNparseCSV('./datasets_csv/Database_NDO.csv', () => {
        const data = object_database_loadfile.objectData;
    
        // Function to format date of birth
        const formatDateOfBirth = (dob) => {
            if (/^\d{4}-\d{2}-\d{2} 00:00:00$/.test(dob)) {
                // If DOB is in the format YYYY-MM-DD 00:00:00, extract the date
                return dob.split(' ')[0];
            } else {
                // Otherwise, return the original DOB
                return dob;
            }
        };

        // Loop through the array of students
        data.forEach(student => {
            const cohort = student.cohort;
            const cohortNum = cohort.match(/\d+/)[0];
            if(cohortNum === chosenCohort) {
                // Convert the name to proper case
                const properCaseName = toProperCase(student.nameofchild);

                // Determine the color based on gender
                const nameColor = student.gender === 'MALE' ? '#89CFF0' : '#F4C2C2';

                // Format the date of birth
                const formattedDob = formatDateOfBirth(student.dateofbirth);

                // Create a div element for each student
                const studentCard = document.createElement('div');
                studentCard.classList.add('student-card');

                // Set the content of the student card
                studentCard.innerHTML = `
                    <p style="color: ${nameColor};">${properCaseName}</p>
                    <hr>
                    <p>${student.class}</p>
                    <p>${student.cohort}</p>
                    <p>${formattedDob}</p>
                `;

                // Append the student card to the container
                container.appendChild(studentCard);
            }
        });
    }); 
}

// Call function on page load
document.addEventListener('DOMContentLoaded', function() {
    
    // Call updateDashboard when the selectors change
    document.getElementById('select-year').addEventListener('change', updateDashboard);
    document.getElementById('select-cohort').addEventListener('change', updateDashboard);

    updateDashboard();
});
