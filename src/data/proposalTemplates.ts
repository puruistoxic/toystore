// Proposal templates based on Indian industry standards for electronics/CCTV installation services

export interface ProposalTemplate {
  id: string;
  name: string;
  category: 'warranty' | 'payment' | 'notes' | 'terms' | 'work_completion';
  content: string;
}

export const proposalTemplates: ProposalTemplate[] = [
  // Warranty Templates
  {
    id: 'warranty-standard-electronics',
    name: 'Standard Electronics Warranty',
    category: 'warranty',
    content: `1. 1 year on-site warranty on Products (CAMERA, NVR, HDD, POE SWITCH)
2. No warranty on consumables (RJ45 Connector and Wiring through Batton/PVC/Flexi)
3. Warranty is VOID in case of PCB components burnt due to voltage surges, fluctuations, incorrect power supply connections, etc.
4. Physically damaged and burned items are not covered in warranty
5. Annual Maintenance Charge is 15% of Total contract value
6. Comprehensive Annual Maintenance Charge is 25% of total contract value`
  },
  {
    id: 'warranty-cctv-comprehensive',
    name: 'CCTV Comprehensive Warranty',
    category: 'warranty',
    content: `1. 1 year comprehensive warranty on all CCTV equipment (Cameras, DVR/NVR, Storage Devices)
2. On-site service and support during warranty period
3. Warranty covers manufacturing defects and component failures
4. Warranty does NOT cover:
   - Physical damage due to mishandling
   - Damage due to power surges or incorrect voltage
   - Water damage or exposure to extreme conditions
   - Tampering or unauthorized modifications
5. Extended warranty available at additional cost
6. AMC (Annual Maintenance Contract) available post-warranty period`
  },
  {
    id: 'warranty-basic',
    name: 'Basic Warranty',
    category: 'warranty',
    content: `1. 1 year warranty on all products
2. Warranty covers manufacturing defects only
3. Warranty void for physical damage, water damage, or power surge damage
4. Service charges applicable for out-of-warranty repairs`
  },

  // Payment Terms Templates
  {
    id: 'payment-70-30',
    name: '70% Advance, 30% on Delivery',
    category: 'payment',
    content: `1. 70% Advance payment required to initiate work
2. 30% Balance payment at the time of material delivery`
  },
  {
    id: 'payment-50-50',
    name: '50% Advance, 50% on Completion',
    category: 'payment',
    content: `1. 50% Advance payment required to initiate work
2. 50% Balance payment upon completion and handover`
  },
  {
    id: 'payment-token',
    name: 'Token Money',
    category: 'payment',
    content: `1. Token amount to be paid to confirm the order
2. Balance payment as per agreed terms`
  },
  {
    id: 'payment-net-30',
    name: 'Net 30 Days',
    category: 'payment',
    content: `1. Payment due within 30 days from invoice date
2. Late payment charges may apply as per terms`
  },

  // Notes Templates
  {
    id: 'notes-standard-cctv',
    name: 'Standard CCTV Installation Notes',
    category: 'notes',
    content: `1. Broadband Connection will be provided by Client to make System online
2. Two Free service visits (one service each month)
3. Two persons will be provided by client till the work is finished
4. This Quotation is valid for 15 Days from the Date of Quotation
5. Products which are not mentioned in above Quotation will be charged separately
6. Wiring through Batton/PVC/Flexi and Cat 6 Wire will be charged as per Actual Used in site
7. Site completion cost may vary by 5-10%`
  },
  {
    id: 'notes-basic-installation',
    name: 'Basic Installation Notes',
    category: 'notes',
    content: `1. Installation includes basic setup and configuration
2. Client to provide necessary infrastructure (power, network)
3. Additional services available at extra cost
4. Quotation valid for 15 days`
  },

  // Work Completion Templates
  {
    id: 'work-completion-standard',
    name: 'Standard Completion Period',
    category: 'work_completion',
    content: `15-30 working days after advance payment`
  },
  {
    id: 'work-completion-fast',
    name: 'Fast Track Completion',
    category: 'work_completion',
    content: `7-15 working days after advance payment (subject to material availability)`
  },
  {
    id: 'work-completion-complex',
    name: 'Complex Project Completion',
    category: 'work_completion',
    content: `30-45 working days after advance payment (for large/complex installations)`
  },

  // Terms & Conditions Templates
  {
    id: 'terms-standard',
    name: 'Standard Terms & Conditions',
    category: 'terms',
    content: `1. This quotation is valid for 15 days from the date of issue
2. Prices are subject to change without prior notice
3. All payments to be made as per agreed payment terms
4. Delivery timeline starts after receipt of advance payment
5. Installation charges are included unless otherwise specified
6. Client is responsible for providing necessary permissions and access
7. Any additional work or changes will be charged separately
8. Company reserves the right to modify terms if required`
  },
  {
    id: 'terms-comprehensive',
    name: 'Comprehensive Terms',
    category: 'terms',
    content: `1. Quotation Validity: This quotation is valid for 15 days from the date of issue
2. Payment Terms: As specified in payment terms section
3. Delivery & Installation: Timeline as per work completion period
4. Price Variation: Prices subject to change based on market conditions
5. Additional Charges: Any work not mentioned in this quotation will be charged separately
6. Site Conditions: Client to ensure site is ready for installation
7. Permissions: Client responsible for all necessary permissions and approvals
8. Force Majeure: Company not liable for delays due to circumstances beyond control
9. Dispute Resolution: Any disputes to be resolved through mutual discussion
10. Jurisdiction: Subject to local jurisdiction laws`
  }
];

export function getTemplatesByCategory(category: ProposalTemplate['category']): ProposalTemplate[] {
  return proposalTemplates.filter(t => t.category === category);
}

