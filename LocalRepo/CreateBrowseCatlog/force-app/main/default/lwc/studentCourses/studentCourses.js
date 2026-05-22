import { LightningElement, api, wire } from 'lwc';
import { ShowToastEvent } from 'lightning/platformShowToastEvent';
import { refreshApex } from '@salesforce/apex';
import getCoursesByStudent from '@salesforce/apex/StudentCourseController.getCoursesByStudent';
import createCourse from '@salesforce/apex/StudentCourseController.createCourse';

export default class StudentCourses extends LightningElement {
    @api recordId; // Student Id

    // Form fields
    courseName = '';
    fee = '';

    // Wire property for courses
    wiredCourses;
    courses = [];

    // Table columns
    columns = [
        { label: 'Course Name', fieldName: 'Course_Name__c', type: 'text' },
        { label: 'Fee', fieldName: 'Fee__c', type: 'currency', typeAttributes: { currencyCode: 'USD' } },
        { label: 'Created Date', fieldName: 'CreatedDate', type: 'date', typeAttributes: { year: 'numeric', month: 'short', day: 'numeric' } }
    ];

    // Wire method to get courses for the student
    @wire(getCoursesByStudent, { studentId: '$recordId' })
    wiredCoursesHandler(result) {
        this.wiredCourses = result;
        if (result.data) {
            this.courses = result.data;
        } else if (result.error) {
            this.showToast('Error', 'Failed to load courses: ' + result.error.body.message, 'error');
        }
    }

    // Handle course name input change
    handleCourseNameChange(event) {
        this.courseName = event.target.value;
    }

    // Handle fee input change
    handleFeeChange(event) {
        this.fee = event.target.value;
    }

    // Handle add course button click
    async handleAddCourse() {
        // Validate inputs
        if (!this.courseName || !this.fee) {
            this.showToast('Validation Error', 'Please fill in all required fields.', 'error');
            return;
        }

        if (isNaN(this.fee) || parseFloat(this.fee) < 0) {
            this.showToast('Validation Error', 'Please enter a valid fee amount.', 'error');
            return;
        }

        try {
            // Call Apex method to create course
            const result = await createCourse({
                studentId: this.recordId,
                courseName: this.courseName,
                fee: parseFloat(this.fee)
            });

            if (result.success) {
                // Show success message
                this.showToast('Success', 'Course created successfully!', 'success');

                // Clear form
                this.courseName = '';
                this.fee = '';

                // Refresh the wired data
                await refreshApex(this.wiredCourses);
            } else {
                this.showToast('Error', result.message || 'Failed to create course.', 'error');
            }
        } catch (error) {
            this.showToast('Error', 'An error occurred while creating course: ' + error.body.message, 'error');
        }
    }

    // Show toast notification
    showToast(title, message, variant) {
        const event = new ShowToastEvent({
            title: title,
            message: message,
            variant: variant
        });
        this.dispatchEvent(event);
    }
}