import { Store } from 'vuex'

import app from './modules/app'
import dashboard from './modules/dashboard'

import assessment from './modules/assessment'

import course from './modules/course'
import courseAssessmentPlan from './modules/course-assessment-plan'
import courseLearningOutcome from './modules/course-learning-outcome'

import CDIOSyllabus from './modules/cdio-syllabus'
import rubric from './modules/rubric'
import studentOutcome from './modules/student-outcome'

import assessmentMethod from './modules/assessment-method'
import proficiencyLevel from './modules/proficiency-level'

import assessmentType from './modules/assessment-type'
import department from './modules/department'
import grading from './modules/grading'
import studyProgram from './modules/study-program'
import user from './modules/user'

import plo_attainment from './modules/plo-attainment'

const store = new Store({
  modules: {
    app,
   
    dashboard,

    assessment,

    course,
    courseLearningOutcome,
    courseAssessmentPlan,
    
    rubric,
    studentOutcome,
    CDIOSyllabus,

    assessmentMethod,
    proficiencyLevel,

    studyProgram,
    department,
    
    assessmentType,
    grading,
    user,

    plo_attainment
  },
})

export default store
