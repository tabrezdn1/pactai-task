import { ResourceWrapper, ProcessingState, FHIRVersion } from "@/types/resource";

export const sampleResourceData: ResourceWrapper[] = [
  {
    resource: {
      metadata: {
        state: ProcessingState.PROCESSING_STATE_COMPLETED,
        createdTime: "2024-01-15T10:30:00Z",
        fetchTime: "2024-01-15T10:35:00Z",
        processedTime: "2024-01-15T10:40:00Z",
        identifier: {
          key: "patient-001-observation-001",
          uid: "obs-12345",
          patientId: "patient-001"
        },
        resourceType: "Observation",
        version: FHIRVersion.FHIR_VERSION_R4
      },
      humanReadableStr: "Blood pressure measurement: 120/80 mmHg recorded on January 15, 2024",
      aiSummary: "Normal blood pressure reading within healthy range for adult patient."
    }
  },
  {
    resource: {
      metadata: {
        state: ProcessingState.PROCESSING_STATE_PROCESSING,
        createdTime: "2024-01-16T09:15:00Z",
        fetchTime: "2024-01-16T09:20:00Z",
        identifier: {
          key: "patient-002-medication-001",
          uid: "med-67890",
          patientId: "patient-002"
        },
        resourceType: "MedicationRequest",
        version: FHIRVersion.FHIR_VERSION_R4
      },
      humanReadableStr: "Prescription for Lisinopril 10mg once daily for hypertension management"
    }
  },
  {
    resource: {
      metadata: {
        state: ProcessingState.PROCESSING_STATE_FAILED,
        createdTime: "2024-01-17T14:22:00Z",
        fetchTime: "2024-01-17T14:25:00Z",
        identifier: {
          key: "patient-003-allergy-001",
          uid: "allergy-54321",
          patientId: "patient-003"
        },
        resourceType: "AllergyIntolerance",
        version: FHIRVersion.FHIR_VERSION_R4B
      },
      humanReadableStr: "Patient reported allergy to penicillin with severe reaction history"
    }
  },
  {
    resource: {
      metadata: {
        state: ProcessingState.PROCESSING_STATE_NOT_STARTED,
        createdTime: "2024-01-18T11:45:00Z",
        fetchTime: "2024-01-18T11:50:00Z",
        identifier: {
          key: "patient-001-lab-001",
          uid: "lab-98765",
          patientId: "patient-001"
        },
        resourceType: "DiagnosticReport",
        version: FHIRVersion.FHIR_VERSION_R4
      },
      humanReadableStr: "Complete blood count (CBC) laboratory results pending analysis"
    }
  },
  {
    resource: {
      metadata: {
        state: ProcessingState.PROCESSING_STATE_COMPLETED,
        createdTime: "2024-01-19T16:30:00Z",
        fetchTime: "2024-01-19T16:35:00Z",
        processedTime: "2024-01-19T16:45:00Z",
        identifier: {
          key: "patient-004-condition-001",
          uid: "cond-11111",
          patientId: "patient-004"
        },
        resourceType: "Condition",
        version: FHIRVersion.FHIR_VERSION_R4
      },
      humanReadableStr: "Diagnosed with Type 2 Diabetes Mellitus, well-controlled with medication",
      aiSummary: "Chronic condition managed with metformin therapy, patient shows good compliance and stable glucose levels."
    }
  }
]; 