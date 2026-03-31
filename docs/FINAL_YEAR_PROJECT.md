**FEDERAL UNIVERSITY OF TECHNOLOGY BABURA**

**FACULTY OF COMPUTING**

**DEPARTMENT OF COMPUTER SCIENCE**

**CLASS SYNC: A MOBILE-BASED CLASS MANAGEMENT AND NOTIFICATION SYSTEM FOR NIGERIAN UNIVERSITY STUDENTS**

A Final Year Project Submitted to the Department of Computer Science,

Federal University of Technology Babura, in Partial Fulfilment

of the Requirements for the Award of the Bachelor of Science (B.Sc.)

Degree in Computer Science.

BY

**AUWAL NURADEEN ILIYASU**

REG. NO: SIT/CSC/23/0004

MARCH 2026

# DECLARATION

I hereby declare that this project work titled "Class Sync: A Mobile-Based Class Management and Notification System for Nigerian University Students" is the result of my own original research and investigation. All sources consulted have been duly acknowledged. This work has not been submitted, in whole or in part, to any other university or institution for the award of any degree or diploma.

Student Signature: ________________________   Date: ______________

Name: AUWAL NURADEEN ILIYASU

Supervisor Signature: ________________________   Date: ______________

Name: DR. KHALID HARUNA 

# DEDICATION

This project is dedicated to every Nigerian university student who has ever missed a class, a test, or an assignment deadline simply because no one passed the information on time.

It is also dedicated to my family, whose unwavering support made this work possible, and to the entire student body of the Federal University of Technology Babura.

# ACKNOWLEDGEMENTS

All praise and glory are due to Almighty God for the wisdom, strength, 

and perseverance granted throughout the course of this project.

I am deeply grateful to my project supervisor, DR. KHALID HARUNA, for 

the guidance, constructive criticism, and academic mentorship that 

shaped this work into its current form. Your patience and dedication 

to excellence were instrumental.

I extend sincere appreciation to the Head of Department and all the 

academic and support staff of the Department of Computer Science, 

Federal University of Technology Babura, for creating an enabling 

academic environment.

My heartfelt thanks go to my parents and siblings for their continuous 

prayers, financial support, and encouragement throughout my academic 

journey.

Finally, I am grateful to my fellow students and colleagues who 

participated in testing and providing feedback for the Class Sync 

application. Your contributions were invaluable.

# ABSTRACT

Class Sync is a cross-platform mobile application developed to address the persistent challenge of poor information dissemination in Nigerian university classroom environments. The current dominant medium for class-related communication “WhatsApp group chats” is unreliable, disorganized, and provides no mechanism for structured delivery of academic information. As a result, students frequently miss lectures, assignments, tests, and important announcements, contributing to poor academic performance and low-class attendance.

This project proposes, designs, and implements Class Sync, a React Native mobile application built on the Expo framework and powered by Google Firebase for real-time data management and push notifications. The system introduces structured Space-and-Course architecture, wherein a class representative (Monitor) creates a Space for their class cohort, adds all relevant courses, and generates unique structured access codes. Students join the Space using these codes and immediately receive push notifications for every new post, including lectures, assignments, tests, notes, and cancellations. The system further supports carryover students, attendance verification via Bluetooth Low Energy (BLE) proximity detection, document sharing, class alarm scheduling, and role-based access control.

The system was developed using the Agile Software Development Methodology and evaluated through functional testing on physical Android devices. Results demonstrate that Class Sync effectively centralizes class information, eliminates over-reliance on informal messaging platforms, and provides a structured, reliable mechanism for academic communication between students, class representatives, and lecturers.

Keywords: Class Management System, Mobile Application, Push Notifications, Firebase, React Native, Bluetooth Low Energy, Attendance Verification, Nigerian Universities.

# LIST OF TABLES

Table 2.1: Comparative Analysis of Class Sync and Related Systems...... 25

Table 3.1: Class Sync System Features................................... 34

# LIST OF FIGURES

Figure 2.1: Use Case Diagram for Class Sync........................... 40

Figure 2.2: Class Diagram for Class Sync................................ 42

Figure 2.3: Sequence Diagram — Post Creation and Notification Delivery.. 44

Figure 2.4: Sequence Diagram — BLE Attendance Verification.............. 44

Figure 2.5: System Architecture Diagram................................ 46

# LIST OF ABBREVIATIONS

# CHAPTER ONE

# INTRODUCTION

## 1.1 Background of the Study

The rapid proliferation of mobile technology across sub-Saharan Africa has transformed nearly every facet of daily life, from commerce and healthcare to governance and social interaction. Within the education sector, however, the full potential of mobile and digital platforms remains largely unrealized, particularly at the tertiary level in Nigeria. Despite the widespread adoption of smartphones among Nigerian university students, the infrastructure for structured, reliable digital communication within the classroom environment remains underdeveloped (Adedoyin & Soykan, 2020).

Nigerian universities are characterized by large class sizes, resource constraints, and a heavy dependence on informal communication channels for the dissemination of academic information. The class representative, known locally as the class monitor, serves as the primary conduit through which academic information flows from lecturers and faculty administration to the student body. This information includes lecture schedules, venue changes, assignment briefs, test dates, notes, and administrative announcements. In most institutions, this flow of information is mediated through unstructured WhatsApp group chats, a practice that has become near-universal across Nigerian campuses (Musa & Ibrahim, 2021).

While WhatsApp offers the advantage of immediacy and ubiquity, it is fundamentally unsuited to structured academic communication. Messages are easily buried under unrelated discussions, there is no enforcement of information hierarchy, and the system provides no mechanism for distinguishing between a critical announcement and casual conversation. Worse, many students mute group notifications entirely to manage the volume of messages, rendering even important announcements invisible (Adeleke, 2022). The consequences of this communication failure are significant: students miss lectures due to venue changes they were never alerted to, submit assignments late because deadline information was not clearly communicated, and fail continuous assessment tests announced with insufficient notice.

Beyond WhatsApp, some Nigerian institutions have adopted Learning Management Systems (LMS) such as Google Classroom, Moodle, and institutional portals. However, adoption among undergraduate students in Nigeria remains inconsistent, hindered by poor internet infrastructure, lack of institutional enforcement, and platforms designed for content delivery rather than real-time classroom communication (Eze et al., 2020). These platforms do not address the immediate, real-time communication needs of day-to-day class management—they are repositories for learning content, not tools for operational class coordination.

The challenge, therefore, is not merely technological but structural: what is needed is a purpose-built mobile application designed specifically for the communication workflows of a Nigerian university class. Such a system must be simple enough for non-technical students to use without training, reliable enough to deliver critical notifications in real time, structured enough to impose information hierarchy, and flexible enough to accommodate the multiple roles involved—students, class monitors, assistant monitors, and lecturers.

Class Sync has been developed in direct response to these identified needs. It is a cross-platform mobile application built on the Expo framework (React Native) with Firebase as the backend infrastructure. The application introduces a hierarchical Space-and-Course architecture that mirrors the organizational structure of a university class. A class monitor creates a Space—representing their cohort—adds all relevant courses and shares a unique structured access code. Students join the Space using this code and are automatically enrolled in all courses, after which they receive real-time push notifications for every academic event posted by the monitor or lecturer.

The system is designed around the mission of maximizing class attendance and continuous assessment participation. Every feature—push notifications, class alarms, attendance verification, materials sharing, and assignment tracking—serves this singular purpose. In doing so, Class Sync represents a significant departure from general-purpose messaging platforms and purpose-built but context-inappropriate LMS tools, filling a practical gap that has long existed in Nigerian university academic communication infrastructure.

## 1.2 Statement of the Problem

The core problem that motivates the development of Class Sync is the systemic failure of existing informal and formal communication channels to reliably convey academic information to students in Nigerian universities. This failure manifests across multiple dimensions:

Unreliable information delivery: WhatsApp group notifications are frequently missed, muted, or buried, resulting in students remaining uninformed about critical academic events such as lecture cancellations, rescheduled classes, and assignment deadlines (Adeleke, 2022).

No structured information hierarchy: Existing platforms conflate administrative announcements, casual conversation, and academic content in a single undifferentiated message stream, making it impossible for students to quickly identify and prioritize vital information.

Lack of accountability: There is no mechanism for class monitors to verify whether academic announcements have been received and read by the students they are intended for, and no way for students to confirm their awareness of key academic events.

Absence of attendance infrastructure: Manual paper-based attendance systems are slow, easily falsified, and provide no historical record that students can reference. There is no existing mobile-native attendance solution designed for Nigerian university classrooms.

Poor support for carryover students: Students repeating courses from previous academic sessions have no structured mechanism to access information about those specific courses independently, creating additional communication gaps.

Inadequate materials distribution: There is no standardized, reliable channel through which lecturers can distribute course materials such as past questions, lecture notes, and assignment briefs directly to enrolled students in a structured and searchable format.

These problems collectively result in poor class attendance, missed deadlines, inadequate preparation for continuous assessment activities, and reduced academic performance—outcomes directly attributable to communication infrastructure failure rather than student disengagement or academic incapacity. Class Sync addresses these problems through a purpose-built, role-aware, notification-first mobile platform designed specifically for the Nigerian university classroom context.

## 1.3 Research Questions

The following research questions guide the design, development, and evaluation of the Class Sync system:

To what extent can a structured mobile application reduce instances of missed lectures and assignment deadlines among Nigerian university students?

How can role-based access control be effectively implemented in a mobile class management system to ensure appropriate information flow between students, class monitors, and lecturers?

What is the effectiveness of Bluetooth Low Energy (BLE) proximity-based attendance verification compared to traditional paper-based and code-based methods in a Nigerian university classroom environment?

How can a mobile application architecture be designed to support real-time, reliable push notification delivery in environments characterized by intermittent network connectivity?

To what degree does the integration of class alarms, assignment tracking, and materials sharing within a unified mobile platform improve student preparedness for continuous assessment activities?

## 1.4 Aim and Objectives of the Study

### Aim

The aim of this study is to design, develop, and evaluate a mobile-based class management and notification system—Class Sync—that provides structured, reliable, and role-appropriate communication infrastructure for Nigerian university classrooms, with the purpose of improving class attendance and continuous assessment participation.

### Objectives

To achieve the stated aim, the following specific objectives are pursued:

To analyze the existing information dissemination practices in Nigerian university classrooms and identify the structural weaknesses of current platforms.

To design a structured Space-and-Course architecture that mirrors the organizational hierarchy of a Nigerian university class, supporting multiple roles including students, class monitors, assistant monitors, and lecturers.

To implement a real-time push notification system using Firebase Cloud Messaging (FCM) that delivers structured academic announcements—lectures, assignments, tests, cancellations, and notes—directly to enrolled students.

To develop a Bluetooth Low Energy (BLE) proximity-based attendance verification system that confirms physical presence without requiring manual code entry, with fallback mechanisms for larger venues.

To implement a role-based access control system that governs the creation, editing, and management of academic content within the application, ensuring appropriate permissions for each user’s role.

To evaluate the system through functional testing on physical Android devices and assess its performance against the identified requirements.

## 1.5 Scope and Limitations

### Scope

Class Sync is scoped as a mobile application for Android and iOS platforms, with primary testing conducted on Android devices. The system covers the following functional areas:

Space and Course management: creation, joining, and administration of class cohorts and their associated courses.

Role-based access control: student, assistant monitor, monitor, and lecturer roles with differentiated permissions.

Post management: creation and delivery of lecture posts, assignments, tests, notes, and announcements with push notification delivery.

Attendance tracking: BLE proximity-based attendance verification with Wi-Fi network fallback and code-based fallback.

Materials sharing upload and download of PDF and document files up to 25MB stored on Firebase Storage.

Class alarm scheduling: native device alarm integration via the device calendar API.

Assignment and test tracking: deadline-aware urgency view with scheduled local notifications.

Carryover student support: individual course enrolment outside primary Space.

Notification preferences: per-Space and per-course notification control.

The system targets Nigerian universities specifically, as reflected in the structured code system using Nigerian institution abbreviations, and the bundled database of all NUC-accredited Nigerian universities.

### Limitations

The following limitations apply to the current implementation of Class Sync:

The system requires internet connectivity for Firebase operations. Offline functionality is limited to locally cached data and does not support offline post creation.

BLE broadcasting is not supported in Android and iOS emulators; BLE attendance verification requires physical devices for testing.

Background BLE scanning is subject to operating system restrictions and may not function reliably on all Android device manufacturers, particularly budget devices common in Nigeria (e.g., Tecno, Infinix, itel).

The system does not currently support institutional integration such as direct connection to university portals or student information systems.

iOS deployment requires an Apple Developer account and App Store review, which is outside the scope of this academic submission.

## 1.6 Significance of the Study

The significance of Class Sync extends across multiple stakeholder groups within the Nigerian university ecosystem:

### Students

Students are the primary beneficiaries of the system. Class Sync directly addresses the information asymmetry that causes students to miss academic events, providing a reliable, structured notification channel that ensures every enrolled student receives timely, unambiguous information about their classes. The integration of class alarms, assignment tracking, and materials sharing further reduces the cognitive burden on students in managing their academic obligations.

### Class Monitors and Assistant Monitors

Class monitors—who currently bear significant informal responsibility for information dissemination with no adequate tools to support them—gain a structured platform through which they can post announcements, track read receipts, manage attendance, and verify that critical information has reached their peers. This significantly reduces the personal burden on class representatives and increases the reliability of the communication they provide.

### Lecturers

Lecturers gain a direct channel to their enrolled students, enabling them to post materials, assignments, and test information without relying on the class monitor as an intermediary. The read receipt system allows lecturers to confirm that important announcements have been acknowledged by students.

### Academic Institutions

At the institutional level, Class Sync contributes to improved class attendance rates, higher continuous assessment participation, and better academic outcomes—all of which are key performance indicators for Nigerian university accreditation and ranking.

### Research Contribution

This study contributes to the academic literature on educational technology in sub-Saharan Africa by demonstrating the design and implementation of a purpose-built mobile communication platform tailored to the specific structural and infrastructural constraints of Nigerian tertiary education. It adds to the growing body of research on mobile learning, proximity-based attendance systems, and role-based information management in educational contexts.

## 1.7 Definition of Terms

The following terms are used throughout this document and are defined below in the context of the Class Sync system:

**Space: **The primary organizational unit in Class Sync, representing a single class cohort. A Space is created by a class monitor and contains all courses offered by that cohort in a given academic session.

**Course: **An individual academic subject within a Space, corresponding to a specific course code offered by a department. Each course has its own activity feed, post history, and member list.

**Monitor: **The class representative, who serves as the administrator of a Space. The monitor has the highest level of permissions within a Space, including the ability to create and delete posts, manage members, assign lecturers, and control the Space configuration.

**Push Notification: **A server-initiated message delivered to a user's mobile device via Firebase Cloud Messaging (FCM), appearing in the device notification tray regardless of whether the application is currently in the foreground.

**Carryover Student: **A student repeating one or more courses from a previous academic session. In Class Sync, carryover students join individual courses using a course-specific code rather than joining a full Space.

**BLE (Bluetooth Low Energy): **A wireless communication protocol designed for short-range data exchange with minimal power consumption. In Class Sync, BLE is used to broadcast a proximity beacon from the monitor's device, which student devices detect to verify physical presence in the classroom.

**Role-Based Access Control (RBAC): **A security model that restricts system access based on a user's assigned role. In Class Sync, roles (Student, Assistant Monitor, Monitor, Lecturer) determine which features a user can access and which actions they can perform.

**Firebase: **Google's mobile and web application development platform, providing backend services including Authentication, Firestore (real-time NoSQL database), Cloud Storage, and Cloud Messaging (FCM).

**Expo: **An open-source framework and platform built on top of React Native that provides a managed development workflow, access to native device APIs, and over-the-air update capabilities.

**Structured Code: **A human-readable, hierarchical access code generated by Class Sync that encodes the university, department, and entry year of a Space or Course (e.g., FUTB-CSC-23 for a Space, or FUTB-CSC-23-COS401 for a Course).

**Attendance Session: **A real-time attendance-taking event initiated by a monitor or assistant monitor during a lecture. The session broadcasts a BLE beacon and generates a time-limited numeric code that students use to mark their presence.

## 1.8 Project Organization

This project report is organized into five chapters as follows:

**Chapter One — Introduction: **Presents the background of the study, statement of the problem, research questions, aim and objectives, scope and limitations, significance of the study, definition of key terms, and the overall project organization.

**Chapter Two — Literature Review: **Reviews relevant academic literature and existing systems related to class management, mobile learning, educational notification systems, attendance management, and related theoretical frameworks. Identifies the research gap that Class Sync addresses.

**Chapter Three — System Analysis and Design: **Presents a detailed analysis of the existing system, describes the proposed Class Sync system, outlines system requirements, and provides the system design including architectural design, database design, input design, and UML diagrams.

**Chapter Four — System Implementation and Testing: **Describes the implementation of the Class Sync system, covering the development environment, tools and frameworks used, implementation details of key modules, and the testing methodology and results.

**Chapter Five — Summary, Conclusion, and Recommendations: **Summarizes the study, draws conclusions from the research and implementation outcomes, highlights contributions to knowledge, and provides recommendations for future work and system enhancement.

# CHAPTER TWO

# LITERATURE REVIEW

## 2.1 Introduction

This chapter reviews the existing body of knowledge relevant to the design and development of Class Sync. The review is structured to first establish the conceptual foundations of the domain—covering mobile learning, learning management systems, class communication tools, and attendance management—before examining the theoretical frameworks that inform the system's design. A critical review of existing related systems follows, culminating in the identification of the specific research gap that Class Sync addresses.

## 2.2 Conceptual Review

### 2.2.1 Mobile Learning (mLearning)

Mobile learning, widely referred to as mLearning, is defined by UNESCO (2013) as learning that takes place across multiple contexts through social and content interactions, using personal electronic devices. The proliferation of affordable smartphones across sub-Saharan Africa has made mLearning an increasingly viable educational delivery mechanism. Traxler (2007) characterizes mLearning as learning that is personal, contextual, and situated qualities that make it particularly appropriate for the operational demands of real-time classroom communication.

In the Nigerian context, Eze et al. (2020) note that smartphone penetration among university students has reached near-universal levels, yet institutional adoption of structured mLearning platforms remains low. The dominant mobile engagement in academic settings remains informal: WhatsApp group communication, voice calls, and SMS. This creates a paradox wherein the infrastructure for mobile-mediated academic communication exists, but the software framework to utilize it productively does not. Class Sync directly addresses this paradox by providing a purpose-built mLearning communication layer that leverages existing device capabilities without requiring institutional infrastructure investment.

### 2.2.2 Learning Management Systems (LMS)

A Learning Management System is a software application or web-based platform that administers documents, tracks, reports, and delivers educational content and training programs (Ellis, 2009). Prominent examples include Moodle, Google Classroom, Blackboard, and Canvas. These platforms offer structured environments for content delivery, assignment submission, grade tracking, and student-teacher communication.

However, research consistently highlights a significant gap between LMS capability and LMS adoption in Nigerian universities. Okonkwo and Ade-Ojo (2012) found that while many Nigerian universities had procured or deployed LMS platforms, actual utilization by students and lecturers remained critically low due to poor internet connectivity, inadequate training, and a culture of face-to-face instruction. More significantly for this study, existing LMS platforms are designed as content repositories and assessment engines rather than real-time operational communication tools. A student cannot configure their LMS profile to receive a push notification when a lecture is cancelled or a venue changed—precisely the use case that Class Sync is designed to address.

### 2.2.3 Push Notification Systems in Education

Push notification technology enables server-side initiation of alerts delivered to a user's mobile device without requiring the application to be actively open. In educational contexts, push notifications have been studied as a mechanism for improving student engagement, deadline compliance, and course retention (Gikas & Grant, 2013). Stockwell (2010) demonstrated that mobile push alerts for vocabulary quizzes in language learning significantly improved engagement over web-based delivery.

Firebase Cloud Messaging (FCM), maintained by Google, is the current industry standard for cross-platform push notification delivery in mobile applications. It provides a reliable, scalable messaging infrastructure that supports device-to-device and server-to-device message delivery (Google, 2023). Class Sync leverages FCM as the backbone of its notification infrastructure, ensuring that academic announcements are delivered to enrolled students in near-real-time regardless of their device's active application state.

### 2.2.4 Attendance Management Systems

Academic attendance is a well-established predictor of academic performance in tertiary education. Romer (1993) demonstrated a statistically significant positive correlation between class attendance and examination performance in university economics courses, a finding replicated across disciplines and institutions. Nigerian universities typically enforce a minimum attendance threshold—commonly set at 75%—as a prerequisite for examination eligibility, making attendance management a formal academic obligation rather than merely a pedagogical preference.

Traditional attendance management in Nigerian universities relies on paper-based sign-in sheets, which are susceptible to proxy signing, time-consuming to process, and difficult to aggregate across sessions. Technology-based alternatives have been explored in research literature, including RFID-based systems (Shoewu & Olaniyi, 2012), QR code scanning systems (Grayson & Sherrill, 2018), and biometric verification systems (Usman et al., 2015). Each of these approaches presents practical limitations in the Nigerian context: RFID and biometric systems require expensive hardware infrastructure; QR code systems are susceptible to code sharing via messaging applications.

Proximity-based attendance verification using Bluetooth Low Energy (BLE) represents a relatively recent development in attendance management research. Kassim et al. (2021) evaluated a BLE-based attendance system and found that it significantly reduced proxy attendance while requiring no additional hardware beyond the smartphones already carried by students and lecturers. Class Sync builds on this approach, implementing a three-tier verification system that combines BLE proximity detection, Wi-Fi network matching, and code-based fallback, providing a more robust solution than any single verification method alone.

### 2.2.5 Role-Based Access Control in Educational Systems

Role-Based Access Control (RBAC) is a widely adopted security model in which access to system resources is governed by the roles assigned to individual users rather than by individual permissions (Ferraiolo et al., 2001). In educational information systems, RBAC enables differentiated access for administrators, lecturers, and students, ensuring that each actor can perform only the operations appropriate to their function within the system.

In Class Sync, RBAC is implemented at the Space level rather than the system level, reflecting the distributed, decentralized nature of Nigerian university class organization. A user may hold distinct roles across different Spaces—serving as a Monitor in their primary class Space while acting as a Student in a Space they joined for a carryover course. This per-Space role architecture is more nuanced than the system-level RBAC typical of institutional LMS platforms and better reflects the actual social structure of Nigerian university cohorts.

## 2.3 Theoretical Framework

### 2.3.1 Technology Acceptance Model (TAM)

The Technology Acceptance Model, originally proposed by Davis (1989), provides a theoretical foundation for understanding user adoption of information systems. TAM posits that two primary variables determine a user's intention to use a technology: Perceived Usefulness (PU)—the degree to which a user believes the system will improve their performance—and Perceived Ease of Use (PEOU)—the degree to which the user believes the system will be free of effort.

TAM has been extensively applied in educational technology research to explain and predict student and faculty adoption of LMS platforms, mobile applications, and other digital learning tools (Ngai et al., 2007). For Class Sync, TAM predicts that adoption will be strongest among students who perceive the application as useful for reducing missed academic events (PU) and who find the onboarding and daily usage experience sufficiently frictionless (PEOU). The design of Class Sync specifically targets both dimensions: the Space code onboarding system minimizes setup friction, while the push notification and alarm features directly and visibly improve students' ability to attend classes and meet deadlines.

### 2.3.2 Information Systems Success Model

DeLone and McLean (2003) propose a comprehensive model for evaluating the success of information systems, identifying six interdependent dimensions: System Quality, Information Quality, Service Quality, Use, User Satisfaction, and Net Benefits. This model is applicable to Class Sync as an evaluative framework: the system's success is measured not merely by its technical functionality but by the quality of information it delivers, the ease with which users engage with it, and the tangible academic benefits it generates for students, monitors, and lecturers.

The DeLone and McLean model is particularly relevant in the Nigerian context, where information quality—the accuracy, timeliness, and relevance of academic notifications—is the dimension most clearly deficient in existing communication infrastructure. Class Sync's structured post types (lecture, assignment, test, note, announcement, cancellation) directly address information quality by imposing taxonomy on academic communication that informal messaging platforms lack.

### 2.3.3 Constructivist Learning Theory

Vygotsky's (1978) social constructivist theory of learning emphasizes the role of social interaction and collaborative knowledge construction in the learning process. From this perspective, the class cohort—students, monitor, and lecturers are not merely an administrative unit but a collaborative learning community whose efficacy depends on the quality of communication and information sharing among its members. Class Sync operationalizes this theoretical principle by providing a shared, structured communication space that supports the collaborative practices through which learning is constructed and sustained within a class cohort.

## 2.4 Review of Related Works

### 2.4.1 Google Classroom

Google Classroom is a widely adopted LMS platform that provides assignment management, communication tools, and grade tracking for educational institutions. It offers mobile applications for Android and iOS and supports push notification delivery. Studies by Shaharanee et al. (2016) found that Google Classroom significantly improved student engagement and communication between students and instructors in Malaysian higher education contexts.

However, Google Classroom presents several limitations in the Nigerian university context. The platform requires institutional Google Workspace accounts for teacher access, creating an administrative barrier not present in Class Sync's code-based onboarding. More critically, Google Classroom is designed as a structured content delivery and assignment submission platform rather than an operational class communication tool: it does not support real-time lecture announcements, venue changes, or the kind of informal but structured operational communication that defines daily class management in Nigerian universities.

### 2.4.2 WhatsApp

WhatsApp is a ubiquitous messaging application used by an estimated ninety million Nigerians as of 2023 (Statista, 2023). In Nigerian universities, WhatsApp groups serve as the de facto class communication platform, used for sharing announcements, files, schedules, and general class coordination. Musa and Ibrahim (2021) surveyed four hundred Nigerian university students and found that 94% of their sample relied on WhatsApp as their primary channel for receiving class information.

Despite its ubiquity, WhatsApp presents structural limitations that make it unsuitable as a primary class management tool. Messages are undifferentiated by type, making it impossible to filter academic announcements from casual conversation. There is no role management, no read receipt system for group announcements, no attendance functionality, and no structured post taxonomy. Class Sync addresses all of these deficiencies while retaining the accessibility and notification immediacy that make WhatsApp appealing to Nigerian university students.

### 2.4.3 Moodle

Moodle is an open-source LMS used by universities worldwide, including several Nigerian institutions. It provides comprehensive tools for course management, assignment submission, grade tracking, forums, and quizzes. Okonkwo and Ade-Ojo (2012) identified Moodle as the most commonly deployed LMS in Nigerian universities, though noting that utilization rates were consistently low.

Moodle's limitations in the Nigerian context are primarily practical rather than technical. The platform requires institutional server infrastructure or paid hosting, imposes significant administrative overhead, and presents a complex interface that creates adoption barriers for both students and non-technical lecturers. Its notification system operates via email rather than mobile push notifications—a significant disadvantage in a population that accesses the internet primarily through mobile devices. Class Sync's mobile-first, push-notification-native design addresses this limitation directly.

### 2.4.4 Classting

Classting is a South Korean educational communication platform designed to facilitate teacher-student communication. It provides class groups, post types differentiated by content, and mobile push notifications. Cho and Castañeda (2019) evaluated Classting in a secondary education context and found it significantly improved communication frequency and teacher-student engagement compared to traditional noticeboard and SMS-based systems.

While Classting shares some conceptual similarities with Class Sync—particularly in its differentiated post types and mobile notification focus—it is designed primarily for primary and secondary education contexts. It does not support carryover student management, BLE attendance verification, structured access codes, or the lecturer role differentiation that are central to Class Sync's design for Nigerian university environments.

### 2.4.5 Edmodo

Edmodo is a social learning platform that provides class groups, assignment management, and teacher-student communication tools. Al-Kathiri (2015) evaluated Edmodo in EFL classroom contexts and found it improved student motivation and participation. The platform provides mobile push notifications and supports file sharing.

Edmodo's limitations parallel those of other general-purpose educational platforms: it is not designed for the real-time operational communication needs of class management, does not support proximity-based attendance verification, and lacks the structured code-based onboarding and role differentiation that Class Sync provides. Furthermore, Edmodo experienced significant service instability, having shut down its free tier for schools in 2022, undermining its reliability as an institutional communication platform.

### 2.4.6 Comparative Summary

Table 2.1 below provides a comparative summary of Class Sync against the reviewed systems across key feature dimensions:

_Table 2.1: Comparative Analysis of Class Sync and Related Systems_

## 2.5 Summary and Research Gap

The literature review reveals a consistent pattern across existing educational communication and management platforms: they are either too general (WhatsApp), too institutionally demanding (Moodle, Google Classroom), too narrow in scope (Classting, Edmodo), or insufficiently focused on the operational real-time communication needs of day-to-day class management in under-resourced tertiary education environments.

Specifically, the review identifies the following gaps in existing solutions that Class Sync is designed to fill:

No existing platform provides a structured, role-aware, push-notification-native mobile system specifically designed for the class monitor—student—lecturer communication hierarchy typical of Nigerian universities.

No existing platform supports BLE proximity-based attendance verification within a comprehensive class management system, particularly one designed for deployment without institutional hardware infrastructure.

No existing platform provides structured support for carryover students as a distinct user category with differentiated enrolment and notification behavior.

No existing platform generates structured, human-readable access codes that encode institutional affiliation and cohort information, enabling decentralized self-service onboarding without administrative gatekeeping.

No existing platform integrates class alarm scheduling, materials sharing, assignment deadline tracking, and read receipt verification within a unified mobile-first interface designed for the Nigerian university context.

Class Sync fills these gaps through a purpose-built, mobile-first application that addresses the specific communication infrastructure needs of Nigerian university classrooms. The following chapter presents the detailed system analysis and design that translates these identified needs into a functional technical specification.

# CHAPTER THREE

# SYSTEM ANALYSIS AND DESIGN

## 3.1 Introduction

This chapter presents a comprehensive analysis of the existing class information dissemination system in Nigerian universities, identifies the specific problems motivating the development of Class Sync, and provides a detailed description of the proposed system. The chapter then specifies the system requirements—both hardware and software—and presents the complete system design, including architectural design, database design, input and output design, and formal UML diagrams describing the system's behavior and structure.

## 3.2 Research Methodology

### 3.2.1 Development Methodology

The development of Class Sync followed the Agile Software Development Methodology, specifically an iterative and incremental development approach informed by the principles of the Agile Manifesto (Beck et al., 2001). Agile was selected over traditional plan-driven methodologies such as the Waterfall Model for several reasons specific to this project:

The requirements for Class Sync evolved through iterative user feedback cycles. Initial functional requirements were supplemented by additional features BLE attendance, materials sharing, class alarms, read receipts that emerged from analysis of student and monitor needs during development.

Agile's emphasis on working software over comprehensive documentation aligned with the practical constraints of a final year project, enabling functional increments to be built, tested, and refined within academic term boundaries.

The iterative nature of Agile development facilitated early detection and correction of technical issues, particularly those related to native Android dependencies such as BLE advertising and Firebase Storage integration.

The development was organized into the following phases, each corresponding to a functional increment of the system:

Phase 1 — Foundation: Firebase configuration, user authentication, Zustand state management, design system constants, and core UI component library.

Phase 2 — Core Features: Space and Course management, structured code generation, post creation and real-time feed, push notification delivery via FCM.

Phase 3 — Redesign and Role Implementation: Complete UI redesign to iOS-native quality standards, role-based access control, author labelling system.

Phase 4 — Advanced Features: BLE proximity attendance, PDF materials sharing, class alarm integration, assignment tracker, and read receipts.

Phase 5 — Testing and Refinement: Functional testing on physical Android devices, bug resolution, performance optimization, and final APK build.

### 3.2.2 Data Collection

Requirements for the Class Sync system were gathered through a combination of:

Observational analysis: Direct observation of existing class information flow in Nigerian university WhatsApp group chats, identifying message patterns, information loss points, and communication failures.

User interviews: Informal structured interviews with class monitors, students, and lecturers at the Federal University of Technology Babura, identifying specific pain points and desired functionality.

Secondary research: Review of academic literature on educational technology, mobile learning, and attendance management systems as presented in Chapter Two.

Iterative feedback: Continuous feedback from test users during development iterations, used to refine UI design, notification behavior, and feature implementation.

## 3.3 Existing System Analysis

The existing system for class information management in Nigerian universities is characterized by a combination of informal digital communication tools and manual administrative processes. The primary components of the existing system are:

### 3.3.1 WhatsApp Group Communication

The dominant information dissemination mechanism. A class monitor creates a WhatsApp group, adds classmates, and posts announcements as they receive them from lecturers or faculty administration. There is no role management, post taxonomy, or notification prioritization. All members receive all messages, and there is no read receipt mechanism for group messages. The quality and timeliness of information depend entirely on the class monitor's diligence and availability.

### 3.3.2 Paper-Based Attendance

Attendance is recorded on paper sign-in sheets circulated during lectures. The monitor or lecturer is responsible for the physical management of these sheets. Sheets are susceptible to proxy signing, easily lost or damaged, and provide no automated aggregation or historical reference for students or lecturers.

### 3.3.3 Informal Materials Distribution

Course materials such as past questions, assignment briefs, and lecture notes are distributed informally through WhatsApp, email, or physical photocopies. There is no centralized repository, no version control, and no mechanism for confirming receipt.

### 3.3.4 Verbal and SMS-Based Announcements

Some announcements, particularly urgent ones such as same-day cancellations—are communicated verbally in class or via direct SMS or phone calls. These mechanisms are ad hoc, dependent on individual contact lists, and provide no audit trail.

## 3.4 Problems of the Existing System

The existing system presents the following specific, documented problems:

Information loss: Critical academic announcements are buried in high-volume WhatsApp chats, with no mechanism to distinguish them from casual conversation. Students who mute group notifications may miss announcements entirely.

Lack of structure: There is no post taxonomy, making it impossible for students to filter or search for specific types of academic information such as all assignments or all test dates.

No accountability: Lecturers and monitors have no mechanism to confirm that a critical announcement has been seen by students. There is no read receipt system for group messages.

Proxy attendance fraud: Paper sign-in sheets enable students to sign on behalf of absent peers, undermining the integrity of attendance records and the enforcement of attendance requirements.

No centralized materials repository: Course materials are scattered across WhatsApp histories, email inboxes, and physical handouts, with no structured discovery mechanism.

Monitor dependency and single point of failure: The entire information flow depends on a single class monitor who may be unavailable, disengaged, or have limited access to information. There is no formalized backup or delegation mechanism.

No carryover student support: Students repeating courses from previous sessions have no structured mechanism to access information about those courses independently.

No deadline tracking: Students have no automated mechanism for tracking upcoming assignments and test deadlines across multiple courses, relying entirely on memory and manual notetaking.

## 3.5 Proposed System Description

Class Sync is a cross-platform mobile application that replaces the existing informal communication infrastructure with a structured, role-aware, notification-first class management platform. The system is built around the following key design principles:

Mission-first design: Every feature directly serves the mission of maximizing class attendance and continuous assessment participation.

Role-awareness: The system recognizes and enforces the differentiated responsibilities of students, monitors, assistant monitors, and lecturers.

Notification-native: Push notifications are not an add-on feature but the primary delivery mechanism for all academic information.

Minimal friction: Onboarding and daily usage are designed to require minimal effort, using structured codes for access and a clean iOS-native interface.

### 3.5.1 System Workflow

The Class Sync system workflow operates as follows:

A class monitor registers on the application, selecting their university from the built-in NUC-accredited university database, entering their department and entry year, and selecting the Monitor role.

The monitor creates a Space for their cohort. The system automatically generates a structured Space Code in the format [UNIVERSITY]-[DEPT]-[YEAR] (e.g., FUTB-CSC-23). The monitor adds all courses to the Space, each receiving a full Course Code (e.g., FUTB-CSC-23-COS401).

The monitor shares the Space Code with classmates via any channel. Students download the application, register, and enter the Space Code to join. Upon joining, students are automatically enrolled in all courses within the Space.

When the monitor or lecturer creates a post—a lecture, assignment, test, note, announcement, or cancellation, the system delivers a push notification to all enrolled students within seconds.

Students receive and interact with posts through the activity feed, set alarms for scheduled lectures, download shared materials, and mark attendance during live attendance sessions.

During lectures, the monitor initiates an attendance session. The monitor's device begins broadcasting a BLE beacon. Students' devices detect the beacon and automatically mark them as present. Students outside BLE range are prompted to move closer; if unable to detect the beacon, they may enter a time-limited code as a fallback.

The monitor can view attendance records, read receipts on important posts, and manage Space membership and course assignments from the Space Management screen.

### 3.5.2 System Features

Table 3.1 below summarizes the key features of the Class Sync system:

_Table 3.1: Class Sync System Features_

## 3.6 System Requirements

### 3.6.1 Hardware Requirements

Development Environment:

Processor: Intel Core i5 (eighth generation or higher) or equivalent

RAM: Minimum 8GB (16GB recommended for Android emulator performance)

Storage: Minimum 20GB free disk space for Android SDK, Node.js dependencies, and project files

Operating System: Windows 10/11, macOS 12 or higher, or Ubuntu 20.04 or higher

Physical Android Device: Android 8.0 (API Level 24) or higher, with Bluetooth 4.0 (BLE) support, for BLE attendance testing

End-User Device Requirements:

Android: Version 8.0 (API Level 24) or higher; minimum 2GB RAM; Bluetooth 4.0 for BLE attendance features

iOS: Version 13.0 or higher; minimum 2GB RAM; Bluetooth 4.0 for BLE attendance features

Network: Active internet connection for Firebase operations; Bluetooth enabled for BLE attendance

### 3.6.2 Software Requirements

Development Tools:

Node.js v18.0 or higher

Expo CLI (latest stable release)

Android Studio (for Android SDK, Gradle build system, and device emulation)

Java Development Kit (JDK) 17

Git for version control

Frameworks and Libraries:

React Native via Expo SDK 52: Cross-platform mobile application framework.

Expo Router: File-system-based navigation

Firebase SDK v9 or higher: Authentication, Firestore, Cloud Storage, Cloud Messaging

Zustand: Lightweight in-memory state management

React Native BLE Manager: Bluetooth Low Energy scanning.

React Native BLE Advertiser: Bluetooth Low Energy beacon broadcasting.

Expo Notifications: Push notification handling and local notification scheduling

Expo Calendar: Native device alarm and calendar integration

Expo Document Picker: File selection for materials upload

date-fins: Date formatting and manipulation.

Lucide React Native: Icon library.

Backend Services:

Google Firebase: Authentication (Email/Password and Google OAuth), Firestore (NoSQL real-time database), Cloud Storage (file hosting), Cloud Messaging (push notifications)

## 3.7 System Design

### 3.7.1 Architectural Design

Class Sync follows a three-tier client-server architecture comprising:

Presentation Tier: The React Native mobile application, responsible for all user interface rendering, user interaction handling, and local state management via Zustand. The application is built using Expo Router for navigation and the DM Sans font family with an iOS-native design system for visual presentation.

Application Logic Tier: The service layer within the React Native application, comprising service modules (authService, spaceService, courseService, postService, notificationService, attendanceService, materialService, alarmService, proximityService) that encapsulate all business logic and mediate between the presentation tier and the data tier.

Data Tier: Google Firebase, providing Firestore for real-time NoSQL data storage, Firebase Authentication for identity management, Firebase Storage for binary file storage, and Firebase Cloud Messaging for push notification delivery.

This architecture ensures a clean separation of concerns: the presentation tier is responsible only for rendering and user interaction, the service layer manages all business logic and data transformation, and Firebase manages all persistence and communication infrastructure.

### 3.7.2 Database Design

Class Sync uses Google Firestore, a NoSQL document database that organizes data into collections and documents. The database schema is designed around the hierarchical ownership relationships of the system. The primary collections and their document structures are as follows:

/users/{uid}: User profile documents containing uid, fullName, email, university, department, entryYear, role (global), createdAt, fcmToken, and notification preferences.

/spaces/{spaceId}: Space documents containing name, university, department, programme, entryYear, spaceCode, monitorUid, memberCount, and createdAt.

/spaces/{spaceId}/members/{uid}: Space membership documents containing uid, role (space-specific), and joinedAt.

/spaces/{spaceId}/courses/{courseId}: Course documents containing courseName, courseCode, fullCode, lecturerUid, lecturerName, and createdAt.

/spaces/{spaceId}/courses/{courseId}/members/{uid}: Course membership documents containing uid, role, isCarryover, accepted, acceptDeadline, and joinedAt.

/spaces/{spaceId}/courses/{courseId}/posts/{postId}: Post documents containing type, title, description, authorUid, authorName, authorRole, createdAt, and type-specific fields.

/spaces/{spaceId}/courses/{courseId}/attendance/{sessionId}: Attendance session documents containing serviceUUID, monitorSsid, code, codeExpiresAt, isOpen, presentCount, and totalMembers.

/spaces/{spaceId}/courses/{courseId}/attendance/{sessionId}/records/{uid}: Individual attendance records containing uid, fullName, markedAt, isPresent, verificationMethod, proximityReading, and isFlagged.

/spaces/{spaceId}/courses/{courseId}/materials/{materialId}: Material documents containing fileName, fileType, fileSizeBytes, storageUrl, uploadedByUid, downloadCount, and createdAt.

/notifications/{uid}/items/{notificationId}: In-app notification documents containing title, body, type, postId, spaceId, courseId, isRead, isCarryover, and createdAt.

### 3.7.3 Input Design

Class Sync implements the following primary input interfaces:

Registration Form Step 1: Full name, email address, and password fields with real-time validation. Google OAuth alternative with iOS-style grouped form rows.

Registration Form Step 2: University search field with live filtering against the NUC university database, department field, role selector as a pill toggle (Student, Monitor, Lecturer), and entry year numeric input.

Space Creation Form: University pre-filled from profile, department, and entry year inputs that auto-generate the Space Code in real time. Course addition rows with course name and code inputs.

Post Creation Sheet: Type-specific form presented as a bottom sheet. All date and time inputs use native device pickers rather than text entry. Required fields are validated before submission.

Join Screen: Single code input field with auto-uppercase formatting, format hint, and real-time Space or Course preview before confirmation.

Attendance Code Input: Six-box OTP-style input for manual code entry fallback during attendance sessions.

### 3.7.4 Output Design

The primary output interfaces of Class Sync are:

Home Dashboard: Personalised greeting, today's classes in horizontal scroll, My Spaces tiles, and recent notices feed—all updated in real time via Firestore onSnapshot listeners.

Activity Feed: Reverse-chronological post feed with type-filtered and course-filtered views, using colour-coded post type tags, author role badges, and urgency indicators for assignments.

Schedule View: Date-strip navigation with a timeline view of lectures for the selected day, including carryover distinction via purple accent colour.

Notification Centre: Sectioned notification list (Today, Yesterday, Earlier) with read and unread distinction and carryover indicators.

Attendance Session Screen: Live display of student names appearing as BLE detection occurs, verification method badges (BLE, Wi-Fi, Code only), and real-time attendance count.

Push Notifications: Delivered to device notification tray with structured format: [SpaceName, CourseCode] [emoji] [Title] — [detail].

## 3.8 System Architecture and UML Diagrams

### 3.8.1 Use Case Diagram

The Use Case Diagram for Class Sync identifies the following actors and their primary interactions with the system:

Actors: Student, Assistant Monitor, Monitor, Lecturer, and Firebase System as an external system actor.

Student use cases include: Register and Login, Join Space by Code, Join Course by Code for carryover enrolment, View Activity Feed, Set Class Alarm, Mark Attendance, Download Materials, View Assignment Tracker, View Notifications, Update Profile, and Change Password.

Monitor use cases include all Student use cases in addition to: Create Space, Create Course, Create all Post types (Lecture, Assignment, Test, Note, Announcement, Cancellation), Edit and Delete Post, Start Attendance Session, Close Attendance Session, View Attendance Records, Override Flagged Attendance, Upload Materials, Delete Materials, Assign Lecturer to Course, Promote or Remove Member, Mark Post as Important, View Read Receipts, Notify Unread Members, Manage Space Settings, and Delete Space.

Assistant Monitor use cases include all Monitor use cases except Delete Space, Transfer Ownership, and Remove Monitor.

Lecturer use cases for assigned courses include: Create Post, Edit and Delete Own Post, Upload Materials, View Attendance Records, Mark Post as Important, View Read Receipts, and Notify Unread Members.

The Firebase System actor handles: Push Notification Delivery via FCM, User Authentication, Data Storage and Retrieval via Firestore, and File Storage and Delivery via Cloud Storage.

### 3.8.2 Class Diagram

The Class Diagram for Class Sync defines the following primary entities and their relationships:

User (attributes: uid, fullName, email, university, department, entryYear, role: UserRole, createdAt, fcmToken). Associations: a Monitor creates a Space; a User creates Posts; a User has many Notifications.

Space (attributes: id, name, university, department, programme, entryYear, spaceCode, monitorUid, memberCount, createdAt). Associations: a Space has many Courses; a Space has many SpaceMembers.

Course (attributes: id, spaceId, courseName, courseCode, fullCode, lecturerUid, lecturerName, createdAt). Associations: a Course belongs to a Space; a Course has many Posts; a Course has many CourseMembers; a Course has many Materials; a Course has many AttendanceSessions.

Post (attributes: id, spaceId, courseId, type: PostType, title, description, authorUid, authorName, authorRole, createdAt, lectureDate, startTime, endTime, venue, dueDate, marks, topics, isImportant). Associations: a Post belongs to a Course; a Post has many ReadReceipts.

AttendanceSession (attributes: id, spaceId, courseId, code, codeExpiresAt, serviceUUID, monitorSsid, isOpen, openedAt, closedAt, presentCount, totalMembers). Associations: belongs to Course; has many AttendanceRecords.

AttendanceRecord (attributes: uid, fullName, markedAt, isPresent, verificationMethod: VerificationMethod, proximityReading, isFlagged). Associations: belongs to AttendanceSession.

Notification (attributes: id, uid, title, body, type, postId, spaceId, courseId, isRead, isCarryover, createdAt). Associations: belongs to User.

### 3.8.3 Sequence Diagram — Post Creation and Notification Delivery

The sequence diagram for the post creation and notification delivery workflow describes the following interaction sequence between the Monitor, the React Native application, the Service Layer, Firestore, and Firebase Cloud Messaging:

Monitor selects a course on the Space Feed screen and taps the FAB to create a post.

The PostTypeSheet component renders, presenting post type options. Monitor selects a type such as Lecture.

The CreatePostSheet form renders with type-specific fields. Monitor completes the form and taps Post.

The presentation layer calls postService.createPost() with the spaceId, courseId, and post data.

postService writes the post document to Firestore at /spaces/{spaceId}/courses/{courseId}/posts/{postId}.

postService retrieves all course members from /spaces/{spaceId}/courses/{courseId}/members/.

For each member, notificationService.saveNotificationToFirestore() is called, writing a notification document to /notifications/{uid}/items/.

notificationService.sendPushNotification() is called for each member with a valid FCM token, submitting the notification to Firebase Cloud Messaging.

Firebase Cloud Messaging delivers the push notification to each student's device.

On the student's device, the onSnapshot listener on the activity feed detects the new post document and updates the feed in real time.

The notification badge count on the student's Home screen updates via the onSnapshot listener on the notifications subcollection.

### 3.8.4 Sequence Diagram — BLE Attendance Verification

The sequence diagram for the BLE attendance verification workflow describes the following interaction sequence:

Monitor navigates to the Space Feed, locates a lecture post, and initiates Start Attendance.

attendanceService.startSession() is called. A unique serviceUUID is generated, the monitor's Wi-Fi SSID is captured, and the session document is written to Firestore.

proximityService.startBeaconBroadcast() begins broadcasting the BLE beacon from the monitor's device.

The live session screen opens on the monitor's device, displaying a real-time student list via Firestore onSnapshot.

Students receive a push notification: 'Attendance Open [CourseCode]'. The Home screen displays an attendance banner.

Student taps the attendance banner. The AttendanceMarkSheet opens in scanning state, displaying the scanning animation.

proximityService.checkProximity() initiates parallel BLE scan and Wi-Fi network match.

If BLE beacon is detected, the ProximityScanResult is returned with method: 'ble'.

attendanceService.markAttendance() is called with verificationMethod: 'ble' and the proximity reading.

The record is written to Firestore with verificationMethod: 'ble' and isFlagged: false.

The monitor's live session screen updates in real time, showing the student's name with a BLE verification badge.

If BLE is not detected but WiFi SSID matches the monitor's SSID, markAttendance is called with verificationMethod: 'wifi'.

If neither BLE nor WiFi matches, the student is presented with the code entry fallback. Successful code entry calls markAttendance with verificationMethod: 'code' and isFlagged: true.

### 3.8.5 System Architecture Diagram Description

The system architecture of Class Sync operates across three layers. At the client layer, the React Native Expo application runs on the user's mobile device. The application is structured into four internal layers: the Presentation Layer comprising screens and UI components; the State Layer comprising Zustand stores for auth, spaces, notifications, and alarms; the Service Layer comprising service modules encapsulating business logic and Firebase interactions; and the Utility Layer comprising helper functions, constants, and the university database.

The client communicates with Google Firebase through the Firebase SDK over HTTPS. Firebase provides four backend services: Firebase Authentication handles user registration and login using email and password and Google OAuth. Firestore provides real-time data synchronisation through onSnapshot listeners that maintain live connections between the application and the database. Firebase Storage provides binary file storage for course materials, served via public download URLs. Firebase Cloud Messaging serves as the push notification delivery infrastructure, receiving notification requests from the service layer and routing them to individual devices via their registered FCM tokens.

For BLE attendance, the application interacts directly with the device's Bluetooth hardware through native modules. The WiFi network detection for the attendance fallback layer is implemented via the expo-network module, which reads the device's current WiFi SSID without requiring a connection to any external service. The class alarm system interacts with the device's native calendar and alarm infrastructure via the expo-calendar module, creating calendar events with alarm triggers that operate independently of the application's runtime state.

# REFERENCES

Adedoyin, O. B., & Soykan, E. (2020). Covid-19 pandemic and online learning: The challenges and opportunities. Interactive Learning Environments, 31(2), 863–875. https://doi.org/10.1080/10494820.2020.1813180

Adeleke, T. (2022). Digital communication tools and academic performance in Nigerian universities: A survey of undergraduate students. African Journal of Information and Communication Technology, 18(1), 45–61.

Al-Kathiri, F. (2015). Beyond the classroom walls: Edmodo in Saudi secondary school EFL instruction, attitudes and challenges. English Language Teaching, 8(1), 189–204. https://doi.org/10.5539/elt.v8n1p189

Beck, K., Beedle, M., van Bennekum, A., Cockburn, A., Cunningham, W., Fowler, M., & Thomas, D. (2001). Manifesto for Agile Software Development. Agile Alliance. http://agilemanifesto.org

Cho, M. H., & Castañeda, D. A. (2019). Motivational and affective factors in self-regulated learning: A case study using the Classting platform. Computer Assisted Language Learning, 32(7), 835–851.

Davis, F. D. (1989). Perceived usefulness, perceived ease of use, and user acceptance of information technology. MIS Quarterly, 13(3), 319–340. https://doi.org/10.2307/249008

DeLone, W. H., & McLean, E. R. (2003). The DeLone and McLean model of information systems success: A ten-year update. Journal of Management Information Systems, 19(4), 9–30.

Ellis, R. K. (2009). A field guide to learning management systems. American Society for Training and Development.

Eze, S. C., Chinedu-Eze, V. C., Okike, C. K., & Bello, A. O. (2020). Factors influencing the use of e-learning facilities by students in a private higher education institution in a developing economy. Humanities and Social Sciences Communications, 7(1), 1–15.

Ferraiolo, D. F., Sandhu, R., Gavrila, S., Kuhn, D. R., & Chandramouli, R. (2001). Proposed NIST standard for role-based access control. ACM Transactions on Information and System Security, 4(3), 224–274.

Gikas, J., & Grant, M. M. (2013). Mobile computing devices in higher education: Student perspectives on learning with cellphones, smartphones and social media. Internet and Higher Education, 19, 18–26.

Google. (2023). Firebase Cloud Messaging documentation. Google Developers. https://firebase.google.com/docs/cloud-messaging

Grayson, W., & Sherrill, A. (2018). QR code-based student attendance management system: Design and implementation. Journal of Educational Technology Systems, 47(1), 43–56.

Kassim, M., Yusoff, N., Abdullah, A., & Zain, J. (2021). Bluetooth low energy-based classroom attendance system. International Journal of Advanced Technology and Engineering Exploration, 8(74), 155–163.

Musa, A. H., & Ibrahim, M. (2021). Utilization of WhatsApp messenger as an academic communication tool among Nigerian university students. International Journal of Educational Technology in Higher Education, 18(1), 1–17.

Ngai, E. W. T., Poon, J. K. L., & Chan, Y. H. C. (2007). Empirical examination of the adoption of WebCT using TAM. Computers and Education, 48(2), 250–267.

Okonkwo, C. W., & Ade-Ojo, G. (2012). Attitudes of teachers and students to e-learning in Nigerian universities. Educational Research and Reviews, 7(14), 331–341.

Romer, D. (1993). Do students go to class? Should they? Journal of Economic Perspectives, 7(3), 167–174.

Shaharanee, I. N. M., Jamil, J. M., & Rodzi, S. S. M. (2016). Google Classroom as a tool for active learning. AIP Conference Proceedings, 1761, 020069.

Shoewu, O., & Olaniyi, O. (2012). Development of attendance management system using biometrics. The Pacific Journal of Science and Technology, 13(1), 300–307.

Statista. (2023). Number of WhatsApp users in Nigeria from 2017 to 2027. Statista Research Department. https://www.statista.com/statistics/1073941/whatsapp-users-in-nigeria/

Stockwell, G. (2010). Using mobile phones for vocabulary activities: Examining the effect of the platform. Language Learning and Technology, 14(2), 95–110.

Traxler, J. (2007). Defining, discussing and evaluating mobile learning: The moving finger writes and having writ. International Review of Research in Open and Distributed Learning, 8(2), 1–12.

UNESCO. (2013). Policy guidelines for mobile learning. United Nations Educational, Scientific and Cultural Organization.

Usman, A. D., Ahmad, M. Z., & Usman, A. M. (2015). Biometric-based attendance management system for Nigerian universities. International Journal of Computer Applications, 110(5), 1–6.

Vygotsky, L. S. (1978). Mind in society: The development of higher psychological processes. Harvard University Press.

