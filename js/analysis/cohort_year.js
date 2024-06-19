class COHORTYEAR {
    // constructor

    //method
    cohort_startyear_endyear(cohort) {
        const first_cohort = 1;
        const first_year = 2022;

        const cohort_num = parseInt(cohort.replace("COHORT", ""));

        const yearDiff = cohort_num - first_cohort;

        const cohort_start_year = first_year + yearDiff;
        const cohort_end_year = cohort_start_year + 4;

        return { start: cohort_start_year, end: cohort_end_year };
    }


}

export { COHORTYEAR };