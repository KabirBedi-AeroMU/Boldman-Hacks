from pptx import Presentation
from pptx.util import Inches, Pt, Emu
from pptx.dml.color import RGBColor
from pptx.enum.text import PP_ALIGN

prs = Presentation()
prs.slide_width = Inches(10)
prs.slide_height = Inches(7.5)

NAVY = RGBColor(0x00, 0x00, 0x80)
SAFFRON = RGBColor(0xFF, 0x99, 0x33)
GREEN = RGBColor(0x13, 0x88, 0x08)
WHITE = RGBColor(0xFF, 0xFF, 0xFF)
BLACK = RGBColor(0x33, 0x33, 0x33)

def add_tricolor_bar(slide):
    """Add a tricolor footer bar at the bottom of the slide"""
    bar_top = Inches(7.0)
    bar_h = Inches(0.4)
    third = Inches(10) // 3
    
    for i, color in enumerate([SAFFRON, WHITE, GREEN]):
        shape = slide.shapes.add_shape(
            1, Emu(third * i), bar_top, Emu(third), bar_h
        )
        shape.fill.solid()
        shape.fill.fore_color.rgb = color
        shape.line.fill.background()

def add_slide_number(slide, num):
    """Add slide number in bottom right"""
    txBox = slide.shapes.add_textbox(Inches(9.3), Inches(7.05), Inches(0.5), Inches(0.3))
    tf = txBox.text_frame
    p = tf.paragraphs[0]
    p.text = str(num)
    p.font.size = Pt(12)
    p.font.color.rgb = WHITE
    p.font.bold = True
    p.alignment = PP_ALIGN.CENTER

def make_content_slide(title_text, body_text, notes_text, slide_num):
    slide = prs.slides.add_slide(prs.slide_layouts[6])  # Blank layout
    
    # Title bar
    title_bg = slide.shapes.add_shape(1, Inches(0), Inches(0), Inches(10), Inches(1.0))
    title_bg.fill.solid()
    title_bg.fill.fore_color.rgb = RGBColor(0xF5, 0xF5, 0xF5)
    title_bg.line.fill.background()
    
    # Title text
    txBox = slide.shapes.add_textbox(Inches(0.5), Inches(0.15), Inches(9), Inches(0.7))
    tf = txBox.text_frame
    tf.word_wrap = True
    p = tf.paragraphs[0]
    p.text = title_text
    p.font.size = Pt(28)
    p.font.bold = True
    p.font.color.rgb = NAVY
    p.alignment = PP_ALIGN.CENTER
    
    # Body content
    txBox2 = slide.shapes.add_textbox(Inches(0.5), Inches(1.2), Inches(9), Inches(5.5))
    tf2 = txBox2.text_frame
    tf2.word_wrap = True
    
    lines = body_text.split('\n')
    for i, line in enumerate(lines):
        if i == 0:
            p = tf2.paragraphs[0]
        else:
            p = tf2.add_paragraph()
        
        p.text = line
        p.font.size = Pt(16)
        p.font.color.rgb = BLACK
        p.space_after = Pt(4)
        
        if line.startswith('•') or line.startswith('  -'):
            p.font.size = Pt(15)
        if line.endswith(':') or (line.startswith('•') and not line.startswith('  ')):
            p.font.bold = True
    
    add_tricolor_bar(slide)
    add_slide_number(slide, slide_num)
    
    # Speaker notes
    notes = slide.notes_slide
    notes.notes_text_frame.text = notes_text
    
    return slide

# ============ SLIDE 1: TITLE ============
slide1 = prs.slides.add_slide(prs.slide_layouts[6])  # Blank

# Navy background header
header_bg = slide1.shapes.add_shape(1, Inches(0), Inches(0), Inches(10), Inches(1.5))
header_bg.fill.solid()
header_bg.fill.fore_color.rgb = NAVY
header_bg.line.fill.background()

txBox = slide1.shapes.add_textbox(Inches(0.5), Inches(0.2), Inches(9), Inches(0.6))
tf = txBox.text_frame
p = tf.paragraphs[0]
p.text = "SMART INDIA HACKATHON 2026"
p.font.size = Pt(32)
p.font.bold = True
p.font.color.rgb = SAFFRON
p.alignment = PP_ALIGN.CENTER

txBox2 = slide1.shapes.add_textbox(Inches(0.5), Inches(0.85), Inches(9), Inches(0.5))
tf2 = txBox2.text_frame
p2 = tf2.paragraphs[0]
p2.text = "TITLE PAGE"
p2.font.size = Pt(24)
p2.font.bold = True
p2.font.color.rgb = WHITE
p2.alignment = PP_ALIGN.CENTER

# Content
details = [
    ("Problem Statement ID –", "SIH1620"),
    ("Problem Statement Title –", "Queuing models in OPDs / availability of beds / admission of patients"),
    ("Theme –", "MedTech / BioTech / HealthTech"),
    ("PS Category –", "Software"),
    ("Team ID –", "[Your Team ID]"),
    ("Team Name –", "[Your Team Name]"),
]

y_pos = 2.0
for label, value in details:
    txBox = slide1.shapes.add_textbox(Inches(0.8), Inches(y_pos), Inches(8.5), Inches(0.45))
    tf = txBox.text_frame
    tf.word_wrap = True
    p = tf.paragraphs[0]
    run1 = p.add_run()
    run1.text = f"•  {label}  "
    run1.font.size = Pt(18)
    run1.font.bold = True
    run1.font.color.rgb = BLACK
    run2 = p.add_run()
    run2.text = value
    run2.font.size = Pt(18)
    run2.font.color.rgb = NAVY
    y_pos += 0.7

add_tricolor_bar(slide1)
add_slide_number(slide1, 1)
slide1.notes_slide.notes_text_frame.text = "In Delhi, 30 million people rely on 38 government hospitals. But right now, if you have a medical emergency, finding an available bed or knowing how long you'll wait in the OPD is completely blind guesswork. It's 2026. We can track a food delivery down to the minute, but we can't track a life-saving hospital bed. Today, we are changing that."

# ============ SLIDE 2: IDEA ============
make_content_slide(
    "SwasthQueue — The Predictive Coordination Layer",
    """• Detailed explanation of the proposed solution:
  A lightweight, mathematically-driven API layer that sits on top of existing NIC/eHospital infrastructure — not a replacement.

• How it addresses the problem:
  - For Patients: Replaces first-come-first-served with Erlang-C powered real-time wait forecasts and smart triage routing.
  - For Officials: Provides a live, city-wide macroscopic view of all 38 Delhi hospitals simultaneously.
  - For Providers: A 1-click admin portal to update active doctors and bed counts in real time.

• Innovation and uniqueness of the solution:
  We didn't build another HMIS. We built the missing "Coordination Layer" that turns static hospital data into predictive, dynamic intelligence.""",
    "We looked at the problem statement and realized something crucial. The government doesn't need another hospital management system. NIC already built eHospital. What's missing isn't the data — it's the intelligence. So we didn't build an HMIS. We built a Predictive Coordination Layer. Three things: A real-time wait forecast, live bed tracking, and a city-wide macroscopic map. These aren't three separate apps. This is one seamless platform. We call it SwasthQueue.",
    2
)

# ============ SLIDE 3: TECHNICAL APPROACH ============
make_content_slide(
    "TECHNICAL APPROACH",
    """• Technologies used:
  - Frontend: React + Vite (GIGW 3.0 & Indian Tricolor UI standards)
  - Backend: FastAPI (Python)
  - Math Engine: M/M/c Queuing Theory (Erlang-C closed-form algorithms)
  - Geolocation: Browser Geolocation API + Haversine distance formula

• Methodology and process:
  1. INGEST — Syncs with hospital DBs to read live active doctors (c) and bed counts.
  2. CALCULATE — Erlang-C engine dynamically recalibrates wait times (W) city-wide the moment any counter changes.
  3. TRIAGE — Booking engine issues priority-adjusted tokens (EMG-402, PRI-301, GEN-105) ensuring urgent patients bypass routine queues.
  4. COORDINATE — City-wide dashboard aggregates all 38 hospitals by radius (500m to 100km) for officials and ambulances.""",
    "Under the hood, this isn't just a database displaying numbers. It's a living, breathing mathematical engine. We implemented Erlang-C queueing models — the same math used to manage global telecommunication networks — and applied it to human lives. If LNJP hospital loses two doctors on a shift, our Provider Portal registers it, the math engine recalibrates instantly, and the wait-time spikes across the city-wide dashboard in real-time.",
    3
)

# ============ SLIDE 4: FEASIBILITY ============
make_content_slide(
    "FEASIBILITY AND VIABILITY",
    """• Analysis of the feasibility:
  100% Feasible. Requires ZERO new hardware. Designed to ingest standard JSON webhooks from existing ABDM/eHospital servers deployed by NIC.

• Potential challenges and risks:
  - Hospital staff failing to manually update live bed counts during a crisis.
  - Network connectivity issues in older government hospital buildings.
  - Resistance to adoption from existing manual-register workflows.

• Strategies for overcoming these challenges:
  - Provider Portal: A frictionless 1-click admin dashboard for overriding active counters and beds.
  - Auto-decrement: The system automatically reduces bed counts the moment an allocation is booked digitally.
  - GIGW 3.0 Compliance: Accessible, mobile-first design that works on any device, even low-end smartphones.""",
    "You might be thinking, 'This sounds great, but how do we deploy this to 38 massive hospitals?' That's the best part. It requires zero new hardware. Because it's an API-first layer, it plugs directly into the existing national digital health infrastructure. The biggest risk is human error — nurses forgetting to update the bed count. So, we designed the Provider Portal to be frictionless. One click. And every digital booking auto-decrements the capacity automatically. It manages itself.",
    4
)

# ============ SLIDE 5: IMPACT ============
make_content_slide(
    "IMPACT AND BENEFITS",
    """• Potential impact on the target audience:
  Secures predictive healthcare routing for the 30,000,000+ citizens of NCT Delhi across all 38 major government facilities.

• Benefits of the solution:
  - SOCIAL (Saving Lives): Eliminates "blind transfers" where ambulances arrive at full hospitals, ensuring critical patients reach a bed faster.
  - ECONOMIC (Efficiency): Balances city-wide load. Redirects routine OPD traffic from overwhelmed hubs (like AIIMS) to underutilized peripheral hospitals.
  - SYSTEMIC (Command & Control): Gives the Health Ministry unprecedented, real-time command-center visibility over the entire city's healthcare network.

• Measurable KPIs:
  - Reduction in average patient wait time by estimated 30-40%
  - Elimination of blind bed-search transfers
  - Real-time city-wide occupancy visibility (currently 0%)""",
    "When you balance the load across 38 hospitals, the impact is staggering. You reduce administrative chaos, you stop ambulances from driving to hospitals that have no beds, and most importantly, you save lives. Oh, and one more thing... (Pause) Everything I just described? It isn't a wireframe. We built the working prototype, the math engine, the Provider Portal, and the geolocated UI. The code is live. Let's look at the demo.",
    5
)

# ============ SLIDE 6: RESEARCH ============
make_content_slide(
    "RESEARCH AND REFERENCES",
    """• Theoretical & Architectural Foundations:

  1. Erlang-C Queuing Theory in Healthcare
     Utilized established M/M/c mathematical models for predicting waiting times in multi-server queues (OPD counters).

  2. Little's Law (L = lambda * W)
     The foundational theorem driving our real-time wait estimations based on arrival rates and time spent in the system.

  3. National Informatics Centre (NIC) eHospital
     Architectural reference for ensuring our Coordination API can seamlessly ingest standard payloads from existing government HMIS.

  4. Ayushman Bharat Digital Mission (ABDM)
     Referenced interoperability standards to ensure future-proof integration with ABHA (Health ID) protocols.

  5. GIGW 3.0 (Guidelines for Indian Government Websites)
     UI/UX compliance standards followed for accessibility and government portal integration.""",
    "We didn't pull these wait times out of thin air. Our engine is built on Erlang-C and Little's Law — the same math used in global logistics and telecom. Furthermore, we architected this specifically to comply with ABDM standards and NIC's eHospital webhooks. It is academically rigorous, technically sound, and ready to deploy. Thank you.",
    6
)

# Save to Desktop for easy access
prs.save("/Users/yuvrajsvisen/Desktop/SIH1620_SwasthQueue_Pitch.pptx")
print("PPTX saved to Desktop successfully!")
