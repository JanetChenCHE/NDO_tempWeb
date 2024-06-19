
const first = {cohort: 1, year: 2022};



const selectCohort = document.getElementById('select-cohort');
const selectCohort_factor_analysis = document.getElementById('select-cohort_factor_analysis');

// Function to add options to a select element
const addOptions = (selectElement, startCohort, endCohort, selectedCohort) => {
    for (let cohortNum = startCohort; cohortNum <= endCohort; cohortNum++) {
        let option = document.createElement('option');
        option.value = cohortNum;
        option.textContent = 'Cohort ' + cohortNum;
        if (cohortNum === selectedCohort) {
            option.selected = true;
        }
        selectElement.appendChild(option);
    }
};

// Determine cohorts based on the condition
if (minYear < first.year) {
    const difference = currentYear - first.year;
    const currentCohort = first.cohort + difference;
    addOptions(selectCohort, first.cohort, currentCohort, first.cohort);
    addOptions(selectCohort_factor_analysis, first.cohort, currentCohort, first.cohort);
} else {
    const difference = currentYear - minYear;
    const minCohort = first.cohort + difference;
    const currentCohort = minCohort + difference;
    addOptions(selectCohort, minCohort, currentCohort, minCohort);
    addOptions(selectCohort_factor_analysis, minCohort, currentCohort, minCohort);
}