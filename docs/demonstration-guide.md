# LifeLink AI — Evaluator & Judge Live Demonstration Guide

Follow this step-by-step presentation script to demonstrate all 14 evaluation requirements.

---

## 1. Opening the Dashboard & Visual Aesthetics
1. Open the application at `http://localhost:5173`.
2. Notice the modern, high-impact healthcare aesthetics: OLED dark theme, high-contrast typography, and statutory emergency hotlines (108 Ambulance, 112 National Police).
3. Point out that the system shows truthful status: `🛡️ LifeLink Emergency Response Ready` with active network status.

---

## 2. Real Location Permission & Accuracy Confidence
1. Navigate to **Location** or observe the GPS card on the Dashboard.
2. Click **Refresh Live GPS**. The browser requests location permission.
3. Observe real coordinates, accuracy radius (e.g. `~15m`), timestamp, and confidence classification (`PRECISE` or `APPROXIMATE`).
4. Click **View on Google Maps** to verify that a clickable link is generated from actual validated coordinates.

---

## 3. Location Failure & Retry Handling
1. If testing on a desktop browser without GPS hardware, show how the system truthfully marks location as `APPROXIMATE` or displays a clear recovery message instead of fabricating fake coordinates.
2. Demonstrate the **Refresh** button retrying location acquisition.

---

## 4. Hospital Discovery & Healthcare Matching
1. Navigate to **Hospitals**.
2. Select **Bhatkal (ಉತ್ತರ ಕನ್ನಡ)** from the city dropdown.
3. Observe real emergency centers returned:
   - **Bhatkal Taluka Government General Hospital** (0.42 km away, ~2 mins drive, ICU Equipped, 24x7 Emergency).
   - **Anjuman Health Care & Diagnostic Centre** (Basti Road, Bhatkal).
4. Click **Directions** to demonstrate seamless integration with Google Maps driving route navigation.
5. Point out the transparent **Match Reason** explaining why each hospital was matched.

---

## 5. SOS Activation & 3-Second Hold Countdown
1. On the **Emergency Dashboard**, select the **Cardiac** category.
2. Click and hold the large red **SOS Button**.
3. Observe the animated circular SVG countdown ring (3.. 2.. 1..) with haptic vibration pulses.
4. Release the button at 2 seconds to demonstrate **instant false-alarm cancellation**.
5. Press and hold for the full 3 seconds to trigger the live emergency broadcast!
6. Alternatively, demonstrate keyboard accessibility by holding the **Spacebar**.

---

## 6. Emergency Event Creation & Real-Time Timeline
1. Observe the top emergency banner appear with a unique cryptographic event ID (e.g. `emg_a1b2c3d4`).
2. Point out the live coordination timeline updating:
   - Event instantiated via Thumb Press.
   - GPS coordinates attached with confidence rating.
   - Nearest 3 specialized facilities matched.
   - Alerts dispatched to trusted contacts.
3. Click **Cancel False Alarm**, provide a reason ("Accidental judge demonstration test"), and observe the status update to `Cancelled`.

---

## 7. Emergency Contacts & Alert Previews
1. Navigate to **Emergency Contacts**.
2. Show pre-configured contacts (e.g. Dr. Sarah, Arjun Kumar).
3. Click **Preview** on any contact.
4. Observe the exact formatted emergency alert text with live Google Maps coordinate URL, emergency category, and timestamp.
5. Click **Test Open in WhatsApp** to verify direct click-to-chat `wa.me` deep-linking.

---

## 8. Notification Delivery & Human Acknowledgement
1. Navigate to **Alerts & Notifications**.
2. Show how carrier delivery (SMS / WhatsApp) is strictly separated from human contact acknowledgement.
3. Click **Simulate Contact Acknowledgement** to show how a contact confirming assistance updates the audit record.

---

## 9. Agentic AI Coordinator with Structured Tools
1. Navigate to **Agentic AI**.
2. Set patient vitals: Heart Rate = 135 bpm, SpO2 = 89%, Category = Cardiac.
3. Click **Execute Agent Coordination**.
4. Observe the multi-tool execution trace:
   - Tool 1: `get_emergency_location`
   - Tool 2: `assess_triage_urgency` (classified as `CRITICAL`)
   - Tool 3: `lookup_first_aid_protocols` (retrieved WHO/Red Cross cardiac guidance)
   - Tool 4: `search_nearby_hospitals` (matched closest cardiac centers)
   - Tool 5: `verify_trusted_contacts`
5. Show the **User Authorization Gate**: Consequential actions require explicit patient authorization before dispatch.

---

## 10. Kannada Language Support (ಕನ್ನಡ)
1. Click the language switcher in the navbar or go to **Settings**.
2. Switch to **ಕನ್ನಡ (Kannada)**.
3. Verify that 100% of the UI — navigation, emergency categories, SOS buttons, first-aid instructions, and status pills — immediately translates into grammatically natural Kannada.

---

## 11. Offline & Low-Network Behavior
1. Open Chrome DevTools ➔ Network tab ➔ Select **Offline**.
2. Refresh or navigate the app.
3. Observe the Service Worker serving the cached application shell.
4. Point out the top bar status badge changing from `Online` to `Offline Cache`.
5. Direct emergency dialers (108, 112) remain 100% functional via native OS telephone protocol (`tel:108`).

---

## 12. Federated Learning Research Dashboard
1. Navigate to **Federated Learning**.
2. Review the 3 simulated hospital clients:
   - Client 1: Bhatkal Taluka Hospital (Rural Secondary, 350 samples)
   - Client 2: Manipal / KMC Hospital (Urban Tertiary Trauma, 650 samples)
   - Client 3: Coastal Cardiology Center (Specialty Center, 450 samples)
3. Point out the authentic test metrics on 300 held-out patient vitals:
   - **FedAvg Global Accuracy**: `87.67%`
   - **Centralized Baseline Ceiling**: `88.00%`
   - **Zero raw patient records uploaded to central server**.
4. Click **Run New 5-Round Experiment** to watch live client updates and FedAvg aggregation recalculate.

---

## 13. Privacy, Security & Data Deletion
1. Navigate to **Medical Profile**.
2. Show voluntary emergency medical parameters (Blood group, allergies, conditions).
3. Demonstrate the explicit consent checkbox.
4. Click **Purge My Medical Data** to verify immediate one-click deletion (Right to be Forgotten).

---

## 14. Safe Judge Demonstration Mode
1. Click **Judge Demo Mode** in the navbar.
2. Select **Scenario 1: Acute Cardiac Arrest in Bhatkal**.
3. Click **Execute Live Walkthrough**.
4. Watch the real-time log stream verify the complete end-to-end pipeline in 5 seconds while ensuring no live cellular SMS charges are billed!
