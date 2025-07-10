import { NextResponse } from 'next/server';
import { faker } from '@faker-js/faker';
import { ResourceWrapper, ProcessingState, FHIRVersion } from '@/types/resource';

/**
 * Generate an array of mock ResourceWrapper objects using faker.
 */
function generateMockResources(count: number): ResourceWrapper[] {
  const healthcareDescriptions = [
    "Blood pressure reading: 120/80 mmHg, heart rate 72 bpm, normal sinus rhythm",
    "Prescribed Metformin 500mg twice daily for Type 2 diabetes management",
    "Patient reports penicillin allergy with previous anaphylactic reaction",
    "Complete blood count shows normal white cell count, hemoglobin 13.5 g/dL",
    "Chest X-ray reveals clear lungs, no acute cardiopulmonary process",
    "Annual wellness visit: BMI 24.2, all vital signs within normal limits",
    "Flu vaccination administered, patient tolerated well, no adverse reactions",
    "MRI brain shows no acute abnormalities, follow-up in 6 months recommended",
    "Colonoscopy completed, 2 small polyps removed and sent for pathology",
    "Patient counseled on smoking cessation, nicotine replacement therapy initiated",
  ];

  const aiSummaries = [
    "Normal vital signs indicate stable cardiovascular health",
    "Medication therapy appropriately managed with good patient compliance",
    "Critical allergy information documented for safe care coordination",
    "Laboratory values within expected range for patient demographics",
    "Imaging results support continued conservative management approach",
    "Preventive care measures completed per clinical guidelines",
    "Vaccination status updated, patient protected against seasonal influenza",
    "Follow-up imaging recommended to monitor previous findings",
    "Routine screening completed with appropriate therapeutic intervention",
    "Patient education provided with evidence-based treatment plan",
  ];

  const states = [
    ProcessingState.PROCESSING_STATE_COMPLETED,
    ProcessingState.PROCESSING_STATE_PROCESSING,
    ProcessingState.PROCESSING_STATE_FAILED,
    ProcessingState.PROCESSING_STATE_NOT_STARTED,
  ];
  const resourceTypes = [
    'Observation',
    'MedicationRequest',
    'AllergyIntolerance',
    'DiagnosticReport',
    'Condition',
    'Patient',
    'Encounter',
    'Procedure',
  ];

  const maxPatientId = Math.max(100_000, Math.floor(count / 2)); // wider pool => ~2 resources per patient on avg

  const resources: ResourceWrapper[] = Array.from({ length: count }).map(() => {
    const state = states[Math.floor(Math.random() * states.length)];
    return {
      resource: {
        metadata: {
          state,
          createdTime: faker.date.recent({ days: 30 }).toISOString(),
          fetchTime: faker.date.recent({ days: 7 }).toISOString(),
          processedTime:
            state === ProcessingState.PROCESSING_STATE_COMPLETED
              ? faker.date.recent({ days: 3 }).toISOString()
              : undefined,
          identifier: {
            key: faker.string.uuid(),
            uid: faker.string.alphanumeric(12),
            patientId: `patient-${faker.number.int({ min: 1, max: maxPatientId })}`,
          },
          resourceType: resourceTypes[Math.floor(Math.random() * resourceTypes.length)],
          version: Math.random() > 0.5 ? FHIRVersion.FHIR_VERSION_R4 : FHIRVersion.FHIR_VERSION_R4B,
        },
        humanReadableStr: faker.helpers.arrayElement(healthcareDescriptions),
        aiSummary: faker.helpers.maybe(() => faker.helpers.arrayElement(aiSummaries), { probability: 0.6 }),
      },
    };
  });

  return resources;
}

export async function GET(request: Request) {
  // Default to one million records if not specified
  const { searchParams } = new URL(request.url);
  const countParam = searchParams.get('count');
  const count = Math.min(parseInt(countParam || '1000000', 10) || 1000000, 1000000);

  // Generate the data
  const data = generateMockResources(count);

  return NextResponse.json(data, {
    status: 200,
    headers: {
      'Cache-Control': 'no-store',
    },
  });
} 