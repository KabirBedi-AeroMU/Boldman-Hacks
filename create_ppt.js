const pptxgen = require("pptxgenjs");

let pptx = new pptxgen();
pptx.layout = 'LAYOUT_16x9';

// Theme colors to match SIH Website (Indian Tricolor)
const NAVY = "000080";
const SAFFRON = "FF9933";
const GREEN = "138808";
const TEXT_COLOR = "333333";

// Helper for Slide Titles
function addTitle(slide, titleText) {
    slide.addText(titleText, { x: 0.5, y: 0.5, w: 9, fontSize: 32, bold: true, color: NAVY, align: "center" });
    // Tricolor footer bar
    slide.addShape(pptx.ShapeType.rect, { x: 0, y: 6.5, w: "33.33%", h: 0.5, fill: { color: SAFFRON } });
    slide.addShape(pptx.ShapeType.rect, { x: "33.33%", y: 6.5, w: "33.34%", h: 0.5, fill: { color: "FFFFFF" } });
    slide.addShape(pptx.ShapeType.rect, { x: "66.67%", y: 6.5, w: "33.33%", h: 0.5, fill: { color: GREEN } });
}

// Slide 1: TITLE PAGE
let slide1 = pptx.addSlide();
slide1.addText("SMART INDIA HACKATHON 2026", { x: 0.5, y: 0.5, w: 9, fontSize: 32, bold: true, color: NAVY, align: "center" });
slide1.addText("TITLE PAGE", { x: 0.5, y: 1.2, w: 9, fontSize: 24, bold: true, color: SAFFRON, align: "center" });
    slide1.addShape(pptx.ShapeType.rect, { x: 0, y: 6.5, w: "33.33%", h: 0.5, fill: { color: SAFFRON } });
    slide1.addShape(pptx.ShapeType.rect, { x: "33.33%", y: 6.5, w: "33.34%", h: 0.5, fill: { color: "FFFFFF" } });
    slide1.addShape(pptx.ShapeType.rect, { x: "66.67%", y: 6.5, w: "33.33%", h: 0.5, fill: { color: GREEN } });

slide1.addText([
    { text: "Problem Statement ID: ", options: { bold: true } },
    { text: "SIH1620\n\n" },
    { text: "Problem Statement Title: ", options: { bold: true } },
    { text: "Queuing models in OPDs / beds\n\n" },
    { text: "Theme: ", options: { bold: true } },
    { text: "MedTech / BioTech / HealthTech\n\n" },
    { text: "PS Category: ", options: { bold: true } },
    { text: "Software\n\n" },
    { text: "Team ID: ", options: { bold: true } },
    { text: "[Your Team ID]\n\n" },
    { text: "Team Name: ", options: { bold: true } },
    { text: "[Your Team Name]" }
], { x: 0.5, y: 2.0, w: 8, fontSize: 18, color: TEXT_COLOR });

slide1.addNotes("In Delhi, 30 million people rely on 38 government hospitals. But right now, if you have a medical emergency, finding an available bed or knowing how long you'll wait in the OPD is completely blind guesswork. It's 2026. We can track a food delivery down to the minute, but we can't track a life-saving hospital bed. Today, we are changing that.");

// Slide 2: IDEA TITLE
let slide2 = pptx.addSlide();
addTitle(slide2, "SwasthQueue - The Predictive Coordination Layer");
slide2.addText("Proposed Solution (Describe your Idea/Solution/Prototype)", { x: 0.5, y: 1.2, w: 9, fontSize: 20, bold: true, color: GREEN, underline: true });
slide2.addText([
    { text: "• Detailed explanation of the proposed solution\n", options: { bold: true } },
    { text: "  A lightweight, mathematically-driven API layer that sits on top of existing NIC/eHospital infrastructure.\n\n" },
    { text: "• How it addresses the problem\n", options: { bold: true } },
    { text: "  For Patients: Replaces first-come-first-served with Erlang-C powered real-time wait forecasts and smart triage routing.\n  For Officials: Provides a live, 100km city-wide macroscopic view of all 38 hospitals simultaneously.\n\n" },
    { text: "• Innovation and uniqueness of the solution\n", options: { bold: true } },
    { text: "  We didn't reinvent the wheel. Instead of building a redundant HMIS, we built a Coordination Layer that turns static hospital data into predictive, dynamic intelligence." }
], { x: 0.5, y: 1.8, w: 9, fontSize: 16, color: TEXT_COLOR });
slide2.addNotes("We looked at the problem statement and realized something crucial. The government doesn't need another hospital management system. NIC already built eHospital. What's missing isn't the data—it's the intelligence. So, we didn't build an HMIS. We built a 'Predictive Coordination Layer'. Three things: A real-time wait forecast, live bed tracking, and a city-wide macroscopic map. These aren't three separate apps. This is one seamless platform. We call it SwasthQueue.");

// Slide 3: TECHNICAL APPROACH
let slide3 = pptx.addSlide();
addTitle(slide3, "TECHNICAL APPROACH");
slide3.addText([
    { text: "• Technologies to be used\n", options: { bold: true } },
    { text: "  - Frontend: React + Vite (GIGW 3.0 & Arogya Setu UI standards)\n  - Backend: FastAPI (Python)\n  - Math Engine: M/M/c Queuing Theory (Erlang-C algorithms)\n\n" },
    { text: "• Methodology and process for implementation\n", options: { bold: true } },
    { text: "  1. Ingest: Syncs with hospital DBs to read live active doctors and bed counts.\n  2. Calculate: Math engine dynamically recalibrates wait times city-wide.\n  3. Triage: Booking engine issues priority-adjusted tokens (e.g., EMG-402) ensuring urgent patients bypass routine queues." }
], { x: 0.5, y: 1.5, w: 9, fontSize: 18, color: TEXT_COLOR });
slide3.addNotes("Under the hood, this isn't just a database displaying numbers. It's a living, breathing mathematical engine. We implemented Erlang-C queueing models—the same math used to manage global telecommunication networks—and applied it to human lives. If LNJP hospital loses two doctors on a shift, our Provider Portal registers it, the math engine recalibrates instantly, and the wait-time spikes across the city-wide dashboard in real-time. It's dynamic, it's fast, and it works flawlessly.");

// Slide 4: FEASIBILITY AND VIABILITY
let slide4 = pptx.addSlide();
addTitle(slide4, "FEASIBILITY AND VIABILITY");
slide4.addText([
    { text: "• Analysis of the feasibility of the idea\n", options: { bold: true } },
    { text: "  100% Feasible. Requires zero new hardware. Designed to ingest standard JSON webhooks from existing ABDM/eHospital servers.\n\n" },
    { text: "• Potential challenges and risks\n", options: { bold: true } },
    { text: "  Hospital staff failing to manually update live bed counts during a crisis.\n\n" },
    { text: "• Strategies for overcoming these challenges\n", options: { bold: true } },
    { text: "  - The Provider Portal: A 1-click admin dashboard that makes overriding active counters and beds completely frictionless.\n  - Auto-decrement: The system automatically reduces bed counts the moment an allocation is booked digitally." }
], { x: 0.5, y: 1.5, w: 9, fontSize: 18, color: TEXT_COLOR });
slide4.addNotes("You might be thinking, 'This sounds great, but how do we deploy this to 38 massive hospitals?' That's the best part. It requires zero new hardware. Because it's an API-first layer, it plugs directly into the existing national digital health infrastructure. The biggest risk is human error—nurses forgetting to update the bed count. So, we designed the Provider Portal to be frictionless. One click. And every digital booking auto-decrements the capacity automatically. It manages itself.");

// Slide 5: IMPACT AND BENEFITS
let slide5 = pptx.addSlide();
addTitle(slide5, "IMPACT AND BENEFITS");
slide5.addText([
    { text: "• Potential impact on the target audience\n", options: { bold: true } },
    { text: "  Secures predictive healthcare routing for the 30,000,000+ citizens of the NCT of Delhi across all 38 major government facilities.\n\n" },
    { text: "• Benefits of the solution\n", options: { bold: true } },
    { text: "  - Social (Saving Lives): Eliminates blind transfers where ambulances arrive at full hospitals.\n  - Economic (Efficiency): Balances the city-wide load. Redirects routine OPD traffic from overwhelmed hubs to underutilized peripheral hospitals.\n  - Systemic: Gives the Health Ministry unprecedented, real-time command-center visibility." }
], { x: 0.5, y: 1.5, w: 9, fontSize: 18, color: TEXT_COLOR });
slide5.addNotes("When you balance the load across 38 hospitals, the impact is staggering. You reduce administrative chaos, you stop ambulances from driving to hospitals that have no beds, and most importantly, you save lives. Oh, and one more thing... (Pause) Everything I just described? It isn't a wireframe. We built the working prototype, the math engine, the Provider Portal, and the geolocated UI in the last 24 hours. The code is live. Let's look at the demo.");

// Slide 6: RESEARCH AND REFERENCES
let slide6 = pptx.addSlide();
addTitle(slide6, "RESEARCH AND REFERENCES");
slide6.addText([
    { text: "• Details / Links of the reference and research work\n\n", options: { bold: true } },
    { text: "  1. Erlang-C Queuing Theory in Healthcare: Utilized established mathematical models (M/M/c) for predicting waiting times in multi-server queues.\n\n" },
    { text: "  2. Little's Law (L = λW): The foundational theorem driving our real-time wait estimations.\n\n" },
    { text: "  3. National Informatics Centre (NIC) eHospital: Architectural reference for ensuring our Coordination API can seamlessly ingest standard payloads.\n\n" },
    { text: "  4. Ayushman Bharat Digital Mission (ABDM): Referenced interoperability standards to ensure future-proof integration with ABHA (Health ID) protocols." }
], { x: 0.5, y: 1.5, w: 9, fontSize: 16, color: TEXT_COLOR });
slide6.addNotes("We didn't pull these wait times out of thin air. Our engine is built on Erlang-C and Little’s Law—the same math used in global logistics. Furthermore, we architected this specifically to comply with ABDM standards and NIC's eHospital webhooks. It is academically rigorous, technically sound, and ready to deploy. Thank you.");

pptx.writeFile({ fileName: "SIH1620_Pitch_Deck.pptx" }).then(() => {
    console.log("PPTX created successfully!");
});
