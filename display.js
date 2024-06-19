
import { DATABASE_LOADFILE } from './js/loadFile/database.js';
import { DATA_LOADFILE } from './js/loadFile/data.js';
import { DATACLEANING } from './js/dataCleaning/dataCleaning.js';
import { array_monthly_EachStudent } from './js/dataCleaning/arrayForEachStudent_weekTOmonth.js';
import { ARRAYMEANFORMONTH } from './js/dataCleaning/arrayMeanForMonth.js';
import { DropDownMenu_array } from './js/forHTML/dropDownMenu_array.js';
import { COHORTYEAR } from './js/analysis/cohort_year.js';
import { LINECHART } from './js/d3/lineChart.js';
import { LINECHART_CLASS } from './js/d3/lineChart_class.js';
import { LINECHART_TEACHER } from './js/d3/lineChart_teacher.js';
import { LINECHART_ATT } from './js/d3/lineChart_att.js';
import { STACKEDBARCHART } from './js/d3/stackedBarchart.js';
import { STACKEDBARCHART_CLASS } from './js/d3/stackedBarChart_class.js';
import { STACKEDBARCHART_TEACHER } from './js/d3/stackedBarChart_teacher.js';
import { LINEARREGRESSION_PREDICTION } from './js/analysis/linearRegression_Prediction.js';

//object
const object_database_loadfile = new DATABASE_LOADFILE();
const object_data_cleaning = new DATACLEANING();
const object_array_monthly_EachStudent = new array_monthly_EachStudent();
const object_array_mean_for_month = new ARRAYMEANFORMONTH();
const object_count_cohort_in_which_year = new COHORTYEAR();
const object_linear_regression_prediction = new LINEARREGRESSION_PREDICTION();
    // chart
const object_linechart = new LINECHART();
const object_linechart_teacher = new LINECHART_TEACHER();
const object_linechart_att = new LINECHART_ATT();
const object_linechart_class = new LINECHART_CLASS();
const object_stackedbarchart = new STACKEDBARCHART();
const object_stackedbarchart_class = new STACKEDBARCHART_CLASS();
const object_stackedbarchart_teacher = new STACKEDBARCHART_TEACHER();

const toProperCase = (str) => {
    return str.toLowerCase().replace(/(?:^|\s|\/)\w/g, (match) => {
        return match.toUpperCase();
    });
};

// Database_NDO
const Database_NDO = './datasets_csv/Database_NDO.csv';
object_database_loadfile.populate(Database_NDO);

// const firstCohort = 1;
// const firstYear = 2022;
const first = {cohort: 1, year: 2022};
const getCurrentYear = new Date().getFullYear();
const getCurrenMonth = (new Date().getMonth()) + 1;
let currentYear = 0;
if(getCurrenMonth < 7) {
    currentYear = getCurrentYear - 1; 
}

// ==============================================================================================
// Dropdown Menu - Teacher Name
// Function to push teacher names from data into the teacherNAME array
let teacherNAME = [];
const pushTeacherNames = (data) => {
    data.forEach(d => {
        if (d.teacher !== undefined) {
            teacherNAME.push(d.teacher.toUpperCase().trim());
        }
    });
};

const difference = currentYear - first.year;
const cohort_current = first.cohort + difference;

// get total five year cohort number
let temp = cohort_current;
let max_fiveYear_cohort = [];
max_fiveYear_cohort.push(cohort_current);
for(let i=5; i>1; i--) {
    if(temp > 1) {
        temp--;
        max_fiveYear_cohort.push(temp);
    }
}

// get all file name for futher for looping and store data
let allFileName_teacher = [];
for(let i=0; i<max_fiveYear_cohort.length; i++) {
    const selectedYear_teacher = document.getElementById('year_teacher').value;
    const fileName1 = `./datasets_csv/KPI_(C${max_fiveYear_cohort[i]})_${selectedYear_teacher}_English_KPIs.csv`;
    const fileName2 = `./datasets_csv/KPI_(C${max_fiveYear_cohort[i]})_${selectedYear_teacher}_Squash_KPIs.csv`;
    allFileName_teacher.push(fileName1);
    allFileName_teacher.push(fileName2);
}

// populate the menu
const objects = allFileName_teacher.map(() => new DATA_LOADFILE());

const loadAndParse = (index) => {
    if (index < allFileName_teacher.length) {
        objects[index].loadNparseCSV(allFileName_teacher[index], getCurrenMonth, () => {
            pushTeacherNames(objects[index].objectData);
            loadAndParse(index + 1);
        });
    } else {
        const object_dropDownMenu_array = new DropDownMenu_array('teacherSelect', teacherNAME);
        object_dropDownMenu_array.populateSelection();
    }
};

loadAndParse(0);

// ==============================================================================================
//Function: Generate Chart
function generateChart(data_English, data_Squash) {
    //Line Chart
    object_linechart.loadLineChart(data_English, data_Squash);
    //Stacked bar Chart
    const array_data_English = object_data_cleaning.removeColumn_OS(object_data_cleaning.makeArrayNoObject(data_English));
    const array_data_Squash = object_data_cleaning.removeColumn_OS(object_data_cleaning.makeArrayNoObject(data_Squash));
    object_stackedbarchart.loadStackedBarChart(array_data_English, "#stacked_bar_chart_english");
    object_stackedbarchart.loadStackedBarChart(array_data_Squash, "#stacked_bar_chart_squash");
}

function generateChart_teacher(data, namesArray) {
    const mean_array = object_array_mean_for_month.countMean_teacher(data, namesArray);
    // Line Chart (All cohort)
    // object_linechart_teacher.loadLineChart(mean_array, mean_array2);
    const new_mean_array = object_data_cleaning.removeColumn_OS(object_data_cleaning.makeArrayNoObject2(mean_array));
    // Stacked Bar Chart (selected cohort)
    object_stackedbarchart_teacher.loadStackedBarChart(new_mean_array, "#stacked_bar_chart_teacher");
    // Line Chart (Selected cohort)
    object_linechart_teacher.loadLineChart_selectedCohort(mean_array);

}

function generateChart_class(data1, data2, selectedClass) {
    // arrange data
    const mean_array_eng = object_array_mean_for_month.countMean(data1, selectedClass);
    const mean_array_squa = object_array_mean_for_month.countMean(data2,selectedClass);
    const new_mean_array_eng = object_data_cleaning.removeColumn_OS(object_data_cleaning.makeArrayNoObject2(mean_array_eng));
    const new_mean_array_squa = object_data_cleaning.removeColumn_OS(object_data_cleaning.makeArrayNoObject2(mean_array_squa));
    //graph
    object_stackedbarchart_class.loadStackedBarChart(new_mean_array_eng, "#stacked_bar_chart_class_english");
    object_stackedbarchart_class.loadStackedBarChart(new_mean_array_squa, "#stacked_bar_chart_class_squash");
    object_linechart_class.loadLineChart(mean_array_eng, mean_array_squa);
}

function findStudentInCohort(filename1, filename2, year, selectedStudent, callback) {

    const object_data_loadfile1 = new DATA_LOADFILE();
    const object_data_loadfile2 = new DATA_LOADFILE();

    object_data_loadfile1.loadNparseCSV(filename1, year, () => {
        const englishData = object_data_loadfile1.objectData;
        object_data_loadfile2.loadNparseCSV(filename2, year, () => {
            const squashData = object_data_loadfile2.objectData;

            const englishStudent = englishData.find(student => student.name === selectedStudent);
            const squashStudent = squashData.find(student => student.name === selectedStudent);

            callback ({ englishStudent, squashStudent });
        });
    });
};

// Forecasting
export function calculation_chosenYear_value_oneLine(data, object) {
    const scores = data.scores;

    let temp = 0;
    let count = 0;
    for(let i=0; i<scores.length; i++) {
        const key = (Object.keys(scores[i])[0]);
        const value = (Object.values(scores[i])[0]);

        if(key === object) {
            if(value !== 0 && !isNaN(value)) {
                temp += value;
                count++;
            }
        }
    }

    const average = Number((temp/count).toFixed(2));
    return average;
}

async function chart_forecasting(selectedStudent, cohort) {
    let array1 = [];
    let array2 = [];

    const year_new_cohort = object_count_cohort_in_which_year.cohort_startyear_endyear(cohort);
    const start_year = year_new_cohort.start;
    const end_year = year_new_cohort.end;
    const currentYear = new Date().getFullYear();
    const cohortNum = parseInt(cohort.replace("COHORT", ""));

    for (let temp_year = start_year; temp_year <= end_year; temp_year++) {
        const englishFile = `./datasets_csv/KPI_(C${cohortNum})_${temp_year}_English_KPIs.csv`;
        const squashFile = `./datasets_csv/KPI_(C${cohortNum})_${temp_year}_Squash_KPIs.csv`;

        if (temp_year <= currentYear) {
            try {
                const object_data_loadfile1 = new DATA_LOADFILE();
                await object_data_loadfile1.loadNparseCSV_async(englishFile, temp_year);
                const englishData = object_data_loadfile1.objectData;
    
                const object_data_loadfile2 = new DATA_LOADFILE();
                await object_data_loadfile2.loadNparseCSV_async(squashFile, temp_year);
                const squashData = object_data_loadfile2.objectData;
    
                const englishStudent = englishData.find(student => student.name === selectedStudent);
                const squashStudent = squashData.find(student => student.name === selectedStudent);

                const english_aveMark = calculation_chosenYear_value_oneLine(englishStudent, 'OS');
                const squash_aveMark = calculation_chosenYear_value_oneLine(squashStudent, 'OS');
    
                array1.push([temp_year, english_aveMark]);
                array2.push([temp_year, squash_aveMark]);

            } catch (error) {
                console.error(`Error processing year ${temp_year}:`, error);
                array1.push([temp_year, NaN]);
                array2.push([temp_year, NaN]);
                console.log(`Fallback data for year ${temp_year}`, { english: array1, squash: array2 });
            }
        } else {
            array1.push([temp_year, NaN]);
            array2.push([temp_year, NaN]);
        }
    }

    // Predicting NaN values for English and squash data
    const array1_forecast = object_linear_regression_prediction.predictNaNValues(array1);
    const array2_forecast = object_linear_regression_prediction.predictNaNValues(array2);

    // Chart
    object_linechart.loadLineChart_yearly(array1_forecast, array2_forecast);
}


// ==============================================================================================
// Student Performance Dashboard

function loadAndGenerateGraph_for_2022(programme1, programme2, chosenYear, chosenCohort, callback) {
    const cohortNum = parseInt(chosenCohort.replace("COHORT", ""));
    const object_data_loadfile1 = new DATA_LOADFILE();
    const fileName1 = `./datasets_csv/KPI_(C${cohortNum})_${chosenYear}_${programme1}_KPIs.csv`;
    const object_data_loadfile2 = new DATA_LOADFILE();
    const fileName2 = `./datasets_csv/KPI_(C${cohortNum})_${chosenYear}_${programme2}_KPIs.csv`;

    object_data_loadfile1.loadNparseCSV(fileName1, chosenYear, () => {
        const data1 = object_data_loadfile1.parsedData;
        // Data Cleaning: change the last occurence "OCTOBER" to "NOVEMBER"
        const monthRow1 = data1[0].slice(2).map(month => month.split(' ')[0].toUpperCase()); // First row containing the month data, accessing the third element
        const lastIndexOct = monthRow1.lastIndexOf("OCTOBER");
        if (lastIndexOct !== -1) {
            monthRow1[lastIndexOct] = "NOVEMBER";
        }
        data1[0] = data1[0].slice(0, 2).concat(monthRow1); // Replace the remaining space with the updated monthRow1

        object_data_loadfile2.loadNparseCSV(fileName2, chosenYear, () => {
            const data2 = object_data_loadfile2.parsedData;
            // Data Cleaning: change the last occurence "OCTOBER" to "NOVEMBER"
            const monthRow2 = data2[0].slice(2).map(month => month.split(' ')[0].toUpperCase()); // First row containing the month data, accessing the third element
            const lastIndexOct = monthRow2.lastIndexOf("OCTOBER");
            if (lastIndexOct !== -1) {
                monthRow2[lastIndexOct] = "NOVEMBER";
            }
            data2[0] = data2[0].slice(0, 2).concat(monthRow2); // Replace the remaining space with the updated monthRow2
        
            const new_data1 = object_array_monthly_EachStudent.arrageArray_returnWithoutObject(data1);
            const nnew_data1 = object_array_monthly_EachStudent.replaceNaNWithMean(new_data1);
            const new_data2 = object_array_monthly_EachStudent.arrageArray_returnWithoutObject(data2);
            const nnew_data2 = object_array_monthly_EachStudent.replaceNaNWithMean(new_data2);
    
            callback(nnew_data1, nnew_data2);
        });
    });
}

function loadAndGenerateGraph(selectedStudentFIND_Database, englishStudent, squashStudent) {
    let data_English=[];
    let data_Squash = [];
    let dataArray = [];
    // English
    dataArray.push(selectedStudentFIND_Database.nameofchild);
    dataArray.push(englishStudent.year);
    data_English.push(dataArray);
    dataArray = [];
    data_English.push(englishStudent.month);
    englishStudent.scores.forEach(element => {
        dataArray.push(element);
    });
    data_English.push(dataArray);
    dataArray = [];

    // Squash
    dataArray.push(selectedStudentFIND_Database.nameofchild);
    dataArray.push(squashStudent.year);
    data_Squash.push(dataArray);
    dataArray = [];
    data_Squash.push(squashStudent.month);
    squashStudent.scores.forEach(element => {
        dataArray.push(element);
    });
    data_Squash.push(dataArray);
    dataArray = [];

    // Generate Chart
    generateChart(data_English, data_Squash);
}

function populateInfo(name, gender, cohort, class_CUB, dob, school) {
    let gender_icon;
    if (gender === 'MALE') {
        gender_icon = "./img/male_icon.png";
    } else if (gender === 'FEMALE') {
        gender_icon = "./img/female_icon.png";
    }
    const personalInfo = `
        <img src="./img/samplePic.jpg" class="sidebar_pic">
        <div class="sidebar_name_gender">
            <p><strong>${name}</strong></p>
            <img src="${gender_icon}" class="genderIcon">
        </div>
        <p>${cohort}</p>
        <p>${class_CUB}</p>
        <p>${dob}</p>
        <p>${school}</p>
    `;
    document.querySelector('.personal_info').innerHTML = personalInfo;
}

import { generateChart_StudentPerformacneDashboard } from './display_attendance.js';
function updateChart(selectedYear, selectedStudent) {
    //delete the currrent graph
    deleteChart ();

    let data_English = [];
    let data_Squash = [];
    let dataArray = [];
    let array1 = [];
    let array2 = [];

    object_database_loadfile.loadNparseCSV(Database_NDO, () => {
        const data_Database_NDO = object_database_loadfile.objectData;
        const selectedStudentFIND_Database = data_Database_NDO.find(student => student.nameofchild === selectedStudent);
        const selectedStudent_cohort = selectedStudentFIND_Database.cohort.replaceAll(' ','');
        const cohortNum = parseInt(selectedStudent_cohort.replace("COHORT", ""));
        const selectedStudent_gender = selectedStudentFIND_Database.gender;
        const selectedStudent_class = selectedStudentFIND_Database.class;
        const selectedStudent_DOB = (selectedStudentFIND_Database.dateofbirth).split(" ")[0];
        const selectedStudent_school = selectedStudentFIND_Database.nameofschool;

    
        // update personalInfo
        populateInfo(toProperCase(selectedStudent), selectedStudent_gender, toProperCase(selectedStudent_cohort), toProperCase(selectedStudent_class), selectedStudent_DOB, selectedStudent_school);

        const fileName1 = `./datasets_csv/KPI_(C${cohortNum})_${selectedYear}_English_KPIs.csv`;
        const fileName2 = `./datasets_csv/KPI_(C${cohortNum})_${selectedYear}_Squash_KPIs.csv`;
    
        // Retrieve data required
        if (selectedStudentFIND_Database) {
            findStudentInCohort(fileName1, fileName2, selectedYear, selectedStudent, ({ englishStudent, squashStudent }) => {
    
            // Forecasting
            chart_forecasting(selectedStudent, selectedStudent_cohort);
    
    
    
            // 2022

            if(selectedYear === '2022') { // ONLY FOR 2022
                const object_data_loadfile1 = new DATA_LOADFILE();
                const object_data_loadfile2 = new DATA_LOADFILE();
                object_data_loadfile1.loadNparseCSV(fileName1, selectedYear, () => {
                    const data_English_KPI = object_data_loadfile1.objectData;
                    object_data_loadfile2.loadNparseCSV(fileName2, selectedYear, () => {
                        const data_Squash_KPI = object_data_loadfile2.objectData;
                        const selectedStudentFIND_Eng_KPI_2022_COHORT1 = data_English_KPI.find(student => student.name === selectedStudent);
                        const selectedStudentFIND_Squash_KPI_2022_COHORT1 = data_Squash_KPI.find(student => student.name === selectedStudent);

                        // 2022_COHORT 1_ENGLISH
                        if (selectedStudentFIND_Eng_KPI_2022_COHORT1) {
                            dataArray.push(selectedStudentFIND_Database.nameofchild);
                            dataArray.push(selectedStudentFIND_Eng_KPI_2022_COHORT1.year);
                            array1.push(dataArray);
                            dataArray = [];
                            array1.push(selectedStudentFIND_Eng_KPI_2022_COHORT1.month);
                            selectedStudentFIND_Eng_KPI_2022_COHORT1.scores.forEach(element => {
                                dataArray.push(element);
                            });
                            array1.push(dataArray);
                            dataArray = [];
            
                            data_English = object_array_monthly_EachStudent.arrangeArray_OS(array1);
                        }
                        // 2022_COHORT 1_SQUASH
                        if (selectedStudentFIND_Squash_KPI_2022_COHORT1) {
                            dataArray.push(selectedStudentFIND_Database.nameofchild);
                            dataArray.push(selectedStudentFIND_Squash_KPI_2022_COHORT1.year);
                            array2.push(dataArray);
                            dataArray = [];
                            array2.push(selectedStudentFIND_Squash_KPI_2022_COHORT1.month);
                            selectedStudentFIND_Squash_KPI_2022_COHORT1.scores.forEach(element => {
                                dataArray.push(element);
                            });
                            array2.push(dataArray);
                            dataArray = [];
                            
                            data_Squash = object_array_monthly_EachStudent.arrangeArray_OS(array2);
                        }
                        // Line Chart
                        object_linechart.loadLineChart(data_English, data_Squash);
            
                        //Stacked bar Chart
                        loadAndGenerateGraph_for_2022('English', 'Squash',selectedYear, selectedStudent_cohort,function(nnew_data1, nnew_data2) {
                            const nnnew_data1 = object_data_cleaning.makeArrayWithoutOS_selectedStudent (nnew_data1, selectedStudent);
                            const nnnew_data2 = object_data_cleaning.makeArrayWithoutOS_selectedStudent (nnew_data2, selectedStudent);
                            
                            object_stackedbarchart.loadStackedBarChart(nnnew_data1, "#stacked_bar_chart_english");
                            object_stackedbarchart.loadStackedBarChart(nnnew_data2, "#stacked_bar_chart_squash");
                        });
                        generateChart_StudentPerformacneDashboard(selectedYear, selectedStudent);
                    });
                });
                
            }
            else {
                // Graph & Correlation
                loadAndGenerateGraph(selectedStudentFIND_Database, englishStudent, squashStudent);
                generateChart_StudentPerformacneDashboard(selectedYear, selectedStudent);
            }
            });
            
        }
    });
    
}

function deleteChart () {
    object_linechart.deleteLineChart();
    object_linechart.deleteLineChart_yearly();
    object_stackedbarchart.deleteStackedBarChart("#stacked_bar_chart_english", "#stacked_bar_chart_squash");
    object_linechart_att.deleteLineChart('#line_chart_att_student');
}

// Class Performance Dashboard

function updateChart_class(selectedClass, selectedCohort, selectedYear) {
    const object_data_loadfile1 = new DATA_LOADFILE();
    const object_data_loadfile2 = new DATA_LOADFILE();
    
    // delete current chart
    deleteChart_class();

    // Retrieve value from user select in "html"
    const cohort = selectedCohort.replaceAll(" ", "");
    const cohortNum = cohort.replace("COHORT", "");

    const fileName1 = `./datasets_csv/KPI_(C${cohortNum})_${selectedYear}_English_KPIs.csv`;
    const fileName2 = `./datasets_csv/KPI_(C${cohortNum})_${selectedYear}_Squash_KPIs.csv`;
    
    // Different cohort starts from different year
    // show the message, that chosen cohort is not start from chosen year
    // Elements to display messages
    const messageDisplayDivs = [
        document.getElementById('messageDisplay1'),
        document.getElementById('messageDisplay2'),
        document.getElementById('messageDisplay3')
    ];

    // Display a message in all message display divs
    const displayMessage = (message) => {
        messageDisplayDivs.forEach(div => div.innerText = message);
    };

    const year_cohort = object_count_cohort_in_which_year.cohort_startyear_endyear(cohort);
    const start = year_cohort.start;
    const end = year_cohort.end;
    if(selectedYear >= start && selectedYear <= end) {
        displayMessage('');
        // 2022
        if(selectedCohort === 'COHORT 1' && selectedYear === '2022') {
            loadAndGenerateGraph_for_2022('English', 'Squash',selectedYear, selectedCohort, function(nnew_data1, nnew_data2) {
                // Chart
                generateChart_class(nnew_data1, nnew_data2, selectedClass);
            });
        }
        else {
            object_data_loadfile1.loadNparseCSV(fileName1, selectedYear, () => {
                const data1 = object_data_loadfile1.parsedData;
                object_data_loadfile2.loadNparseCSV(fileName2, selectedYear, () => {
                    const data2 = object_data_loadfile2.parsedData;
                    // Chart
                    generateChart_class(data1, data2, selectedClass);
                });
            });
        }
    }
    else {
        if(!isNaN(start) && !isNaN(end)) {
            displayMessage(`${selectedCohort} is started in ${start} & ended in ${end}`);
        }
    }
}

function deleteChart_class() {
    object_linechart_class.deleteLineChart();
    object_stackedbarchart_class.deleteStackedBarChart_class("#stacked_bar_chart_class_english", "#stacked_bar_chart_class_squash");
}

// Get the student names in array depending on the teacher
function filterAndAddNames(dataset, selectedteacher) {
    const namesSet = new Set();
    dataset.forEach(student => {
        if(student.teacher.includes('/') ? student.teacher.split('/').includes(selectedteacher) : student.teacher === selectedteacher) {
            namesSet.add(student.name);
        }
    });
    return [...namesSet];
}

// Teacher Performance Dashboard

import { generateChart_TeacherPerformacneDashboard } from './display_attendance.js';

function populateInfo_teacher(name, cohort, programme) {
    let programme_pic;
    if (programme === 'English Teacher') {
        programme_pic = "./img/EnglishBook.png";
    } else if (programme === 'Squash Teacher') {
        programme_pic = "./img/squash_racket.png";
    }
    const personalInfo = `
        <img src="./img/teacher.png" class="sidebar_pic">
        <div class="sidebar_name_gender">
            <p><strong>${name}</strong></p>
            <img src="${programme_pic}" class="genderIcon">
        </div>
        <p>${programme}</p>
        <p>${cohort}</p>
    `;
    document.querySelector('.teacher_info').innerHTML = personalInfo;
}

function updateChart_teacher(selectedYear, selectedteacher, selectedCohort) {
    // Delete current chart
    deleteChart_teacher();

    // Retrieve value from user select in "html"
    const selectedCohort_withoutSpace = selectedCohort.replaceAll(' ', '');
    const cohortNum = parseInt(selectedCohort_withoutSpace.replace("COHORT", ""));


    const fileName1 = `./datasets_csv/KPI_(C${cohortNum})_${selectedYear}_English_KPIs.csv`;
    const fileName2 = `./datasets_csv/KPI_(C${cohortNum})_${selectedYear}_Squash_KPIs.csv`;

    const object_data_loadfile1 = new DATA_LOADFILE();
    const object_data_loadfile2 = new DATA_LOADFILE();
    object_data_loadfile1.loadNparseCSV(fileName1, selectedYear, () => {
        const data1 = object_data_loadfile1.parsedData;
        const data1_objectName = object_data_loadfile1.objectData;
        
        object_data_loadfile2.loadNparseCSV(fileName2, selectedYear, () => {
            const data2 = object_data_loadfile2.parsedData;
            const data2_objectName = object_data_loadfile2.objectData;
            const English = data1_objectName.find(student => student.teacher === selectedteacher);
            const Squash = data2_objectName.find(student => student.teacher === selectedteacher);
            // Chart
            if(English) {
                const namesArray = filterAndAddNames(data1_objectName, selectedteacher);
                generateChart_teacher(data1, namesArray);
                generateChart_TeacherPerformacneDashboard(selectedYear, selectedteacher, namesArray);
                populateInfo_teacher(toProperCase(selectedteacher), toProperCase(selectedCohort), 'English Teacher');
            }
            else if(Squash) {
                const namesArray = filterAndAddNames(data2_objectName, selectedteacher);
                generateChart_teacher(data2, namesArray);
                generateChart_TeacherPerformacneDashboard(selectedYear, selectedteacher, namesArray);
                populateInfo_teacher(toProperCase(selectedteacher), toProperCase(selectedCohort), 'Squash Teacher');
            };
        });
    });
}

function deleteChart_teacher() {
    object_linechart_att.deleteLineChart('#line_chart_att_teacher');
    object_linechart_teacher.deleteLineChart();
    object_stackedbarchart_teacher.deleteStackedBarChart_teacher("#stacked_bar_chart_teacher");
}

function updateDashboard() {

    // Student Performance Dashboard
    const selectedYear1 = document.getElementById('year_student_line').value;
    const selectedStudent = document.getElementById('studentSelect').value;
    updateChart(selectedYear1, selectedStudent);

    // Class Performance Dashboard
    const selectedClass = document.getElementById('classSelect').value;
    const selectedCohort1 = document.getElementById('cohortSelect').value;
    const selectedYear2 = document.getElementById('year_class').value;
    updateChart_class(selectedClass, selectedCohort1, selectedYear2);

    // Teacher Performance Dashboard
    const selectedYear3 = document.getElementById('year_teacher').value;
    const selectedteacher = document.getElementById('teacherSelect').value;
    const selectedCohort2 = document.getElementById('cohortSelect_teacher').value;
    updateChart_teacher(selectedYear3, selectedteacher, selectedCohort2);

}

function updateStudentPerformanceDashboard() {

    // Student Performance Dashboard
    const selectedYear1 = document.getElementById('year_student_line').value;
    const selectedStudent = document.getElementById('studentSelect').value;
    updateChart(selectedYear1, selectedStudent);

}

function updateClassPerformanceDashboard() {

    // Class Performance Dashboard
    const selectedClass = document.getElementById('classSelect').value;
    const selectedCohort1 = document.getElementById('cohortSelect').value;
    const selectedYear2 = document.getElementById('year_class').value;
    updateChart_class(selectedClass, selectedCohort1, selectedYear2);

}

function updateTeacherPerformanceDashboard() {

    // Teacher Performance Dashboard
    const selectedYear3 = document.getElementById('year_teacher').value;
    const selectedteacher = document.getElementById('teacherSelect').value;
    const selectedCohort2 = document.getElementById('cohortSelect_teacher').value;
    updateChart_teacher(selectedYear3, selectedteacher, selectedCohort2);

}

document.addEventListener('DOMContentLoaded', function() {
    updateDashboard();

    // Student Performance Dashboard
    document.getElementById('studentSelect').addEventListener('change', updateStudentPerformanceDashboard);
    document.getElementById('year_student_line').addEventListener('change', updateStudentPerformanceDashboard);

    // Class Performance Dashboard
    document.getElementById('classSelect').addEventListener('change', updateClassPerformanceDashboard);
    document.getElementById('cohortSelect').addEventListener('change', updateClassPerformanceDashboard);
    document.getElementById('year_class').addEventListener('change', updateClassPerformanceDashboard); 

    // Teacher Performance Dashboard
    document.getElementById('teacherSelect').addEventListener('change', updateTeacherPerformanceDashboard);
    document.getElementById('year_teacher').addEventListener('change', updateTeacherPerformanceDashboard); 
    document.getElementById('cohortSelect_teacher').addEventListener('change', updateTeacherPerformanceDashboard);

});
