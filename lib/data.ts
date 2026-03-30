// lib/data.ts

export interface Announcement {
  id: string;
  title: string;
  author: string;
  role: 'Engineer' | 'Healthcare Professional';
  institution: string;
  domain: string;
  projectStage: string;
  commitment: string;
  location: string;
  pitch: string;
  clinicalContext: string;
  technicalChallenge: string;
  requirements: string[];
  time: string;
  status: 'Active' | 'Meeting Scheduled' | 'Partner Found' | 'Expired';
}

export const announcements: Announcement[] = [
  {
    id: '1',
    title: 'AI-assisted ECG interpretation in low-resource settings',
    author: 'Dr. Amara Osei',
    role: 'Healthcare Professional',
    institution: 'Mayo Clinic',
    domain: 'Cardiology',
    projectStage: 'Pilot Testing',
    commitment: 'Research Partner',
    location: 'Rochester, US',
    pitch: 'We have validated the model but need a technical lead to optimize latency for edge device deployment in rural clinics.',
    clinicalContext: 'Early detection of atrial fibrillation is critical in rural areas where specialist access is limited. Our study shows 94% sensitivity.',
    technicalChallenge: 'Current models require high compute. We need quantization or pruned architectures that can run on low-power hardware with <200ms latency.',
    requirements: ['Experience with model quantization', 'Familiar with medical time-series data', 'Interest in social impact'],
    time: '2h ago',
    status: 'Active',
  },
  {
    id: '2',
    title: 'Pressure-responsive scaffold for cartilage regeneration',
    author: 'Lena Hartmann',
    role: 'Engineer',
    institution: 'ETH Zürich',
    domain: 'Biotech',
    projectStage: 'Prototype Developed',
    commitment: 'Co-founder',
    location: 'Zürich, CH',
    pitch: 'Seeking a clinical partner in Orthopedics for human-in-the-loop validation of our smart scaffold architecture.',
    clinicalContext: 'Cartilage doesn\'t heal easily. Existing scaffolds fail under load. Our design mimics natural joint mechanics.',
    technicalChallenge: 'We use a micro-porous lattice printed with bioactive resin. The release of growth factors is triggered by mechanical compression.',
    requirements: ['Clinical experience in Orthopedics', 'Knowledge of synovial fluid bio-markers', 'Able to commit to pre-clinical trials'],
    time: '5h ago',
    status: 'Active',
  },
  {
    id: '3',
    title: 'Intraoperative AI guidance for neurosurgery',
    author: 'Prof. James Whitfield',
    role: 'Healthcare Professional',
    institution: 'Johns Hopkins',
    domain: 'Neurosurgery',
    projectStage: 'Concept Validation',
    commitment: 'Advisor',
    location: 'Baltimore, US',
    pitch: 'Haptic feedback is solved; real-time tremor cancellation guidance via computer vision is the next frontier.',
    clinicalContext: 'Surgeon fatigue during 12-hour craniofacial reconstructions leads to micro-tremors. We need intraoperative co-piloting.',
    technicalChallenge: 'Tracking instruments in 3D with sub-millimeter precision under variable lighting conditions and anatomical occlusion.',
    requirements: ['Computer Vision (SLAM)', 'Robotics (Control Systems)', 'Experience with medical imaging (DICOM)'],
    time: '8h ago',
    status: 'Active',
  }
];
