/**
 * @description Controller class for Student Course Registration functionality
 * Provides methods to fetch and create course records for students
 */
public with sharing class StudentCourseController {
    
    /**
     * @description Get all courses for a specific student
     * @param studentId The Id of the student to fetch courses for
     * @return List<Course__c> List of course records for the student
     */
    @AuraEnabled
    public static List<Course__c> getCoursesByStudent(Id studentId) {
        if (studentId == null) {
            return new List<Course__c>();
        }
        
        return [
            SELECT Id, Name, Course_Name__c, Fee__c, Student__c
            FROM Course__c
            WHERE Student__c = :studentId
            ORDER BY CreatedDate DESC
        ];
    }
    
    /**
     * @description Create a new course registration for a student
     * @param studentId The Id of the student registering for the course
     * @param courseName The name of the course
     * @param fee The course fee amount
     * @return Course__c The newly created course record
     */
    @AuraEnabled
    public static Course__c createCourse(Id studentId, String courseName, Decimal fee) {
        if (studentId == null || String.isBlank(courseName) || fee == null) {
            throw new AuraHandledException('All fields are required to create a course.');
        }
        
        Course__c newCourse = new Course__c(
            Student__c = studentId,
            Course_Name__c = courseName,
            Fee__c = fee
        );
        
        try {
            insert newCourse;
            return newCourse;
        } catch (DmlException e) {
            throw new AuraHandledException('Error creating course: ' + e.getMessage());
        }
    }
}