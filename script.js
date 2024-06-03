document.addEventListener("DOMContentLoaded", function() {
    // Initialize response object to store user inputs
    const responses = {
        aidType: '', decision: '', motivation: [], role: '', decisionStage: '',
        concerns: '', information: '', importance: '',
        riskFactors: [], testingFrequency: ''
    };

    // Current step in the form
    let currentStep = 'introStep';
    // Total number of steps
    const totalSteps = 10;
    // Order of steps
    const stepOrder = ['introStep', 'combinedIntroStep', 'step1', 'step2', 'step3', 'step4', 'step5', 'step6', 'step7', 'step8', 'step9', 'summaryStep'];

    // CTA link and resource links
    const ctaLink = "https://staging.gofreddie.com/form/province-q";
    const prepResources = [
        { text: "GoFreddie - PrEP Explained", link: "https://www.gofreddie.com/prep-explained" },
        { text: "Canada Public Health - HIV Factsheet", link: "https://www.canada.ca/en/public-health/services/publications/diseases-conditions/hiv-factsheet-biomedical-prevention-prep-pep.html" }
    ];
    const doxypepResources = [
        { text: "GoFreddie - DoxyPEP Explained", link: "https://help.gofreddie.com/hc/en-us/articles/18571563134615-What-is-Doxy-PEP-for-STI-prevention" },
        { text: "Dosing and Education", link: "https://help.gofreddie.com/hc/en-us/articles/18571643900695-Doxy-PEP-dosing-and-education" }
    ];

    // Helper function to get an element by ID
    const getElement = (id) => document.getElementById(id);

    // Update the progress bar based on the current step
    const updateProgressBar = () => {
        const progressBar = document.querySelector('.progress-bar div');
        const progressSteps = document.querySelectorAll('.progress-steps span');
        if (progressBar) {
            const currentIndex = stepOrder.indexOf(currentStep);
            const progress = ((currentIndex - 1) / (totalSteps - 1)) * 100;
            progressBar.style.width = `${progress}%`;
            progressSteps.forEach((step, index) => {
                if (index < currentIndex - 1) {
                    step.classList.add('completed');
                } else {
                    step.classList.remove('completed');
                }
            });
        }
    };

    // Helper function to add or remove a class from a list of elements
    const toggleClass = (elements, className, action) => {
        elements.forEach(el => el.classList[action](className));
    };

    // Set the response for a single-select question and move to the next step
    const setResponse = (question, value, step) => {
        responses[question] = value;
        toggleClass(document.querySelectorAll(`#${step} .option`), 'selected', 'remove');
        document.querySelector(`#${step} .option[onclick*="${value}"]`).classList.add('selected');
        nextStep(step);
    };

    // Toggle the response for a multi-select question
    const toggleResponse = (question, value, element) => {
        const index = responses[question].indexOf(value);
        if (index > -1) {
            responses[question].splice(index, 1);
            element.classList.remove('selected');
        } else {
            responses[question].push(value);
            element.classList.add('selected');
        }
    };

    // Navigate to the next step
    const nextStep = (step) => {
        try {
            getElement(step).classList.remove('active');
            getElement(step).style.display = 'none';
            if (step === 'introStep') {
                currentStep = 'combinedIntroStep';
                if (responses.aidType === 'PrEP') {
                    getElement('prepIntroContent').style.display = 'block';
                    getElement('doxypepIntroContent').style.display = 'none';
                } else if (responses.aidType === 'DoxyPEP') {
                    getElement('prepIntroContent').style.display = 'none';
                    getElement('doxypepIntroContent').style.display = 'block';
                }
            } else if (step === 'step9') {
                currentStep = 'summaryStep';
                updateSummary();
            } else {
                currentStep = stepOrder[stepOrder.indexOf(step) + 1];
            }
            if (currentStep) {
                getElement(currentStep).style.display = 'block';
                getElement(currentStep).classList.add('active');
                updateURL(currentStep);
                if (step !== 'introStep') updateProgressBar();
            } else {
                evaluateResponses();
            }
        } catch (error) {
            console.error('Error navigating to the next step:', error);
            alert('An error occurred while navigating. Please try again.');
        }
    };

    // Navigate to the previous step
    const prevStep = (step) => {
        getElement(step).classList.remove('active');
        getElement(step).style.display = 'none';
        currentStep = stepOrder[stepOrder.indexOf(step) - 1];
        if (currentStep) {
            getElement(currentStep).style.display = 'block';
            getElement(currentStep).classList.add('active');
            updateURL(currentStep);
            if (currentStep !== 'introStep') updateProgressBar();
        }
    };

    // Update the summary content based on user responses
    const updateSummary = () => {
        const summaryContent = `
            <div class="summary-card">
                <h4><i class="fas fa-capsules icon"></i> Medication Details</h4>
                <p><strong>Aid Type:</strong> ${responses.aidType}</p>
                <p><strong>Decision:</strong> ${responses.decision}</p>

                <h4><i class="fas fa-thumbs-up icon"></i> Motivation</h4>
                <p><strong>Motivations:</strong> ${responses.motivation.join(', ')}</p>

                <h4><i class="fas fa-user-cog icon"></i> Role in Decision</h4>
                <p><strong>Role:</strong> ${responses.role}</p>

                <h4><i class="fas fa-hourglass icon"></i> Decision Stage</h4>
                <p><strong>Decision Stage:</strong> ${responses.decisionStage}</p>

                <h4><i class="fas fa-exclamation-circle icon"></i> Concerns</h4>
                <p><strong>Concerns:</strong> ${responses.concerns}</p>

                <h4><i class="fas fa-info-circle icon"></i> Information</h4>
                <p><strong>Information:</strong> ${responses.information}</p>

                <h4><i class="fas fa-flag icon"></i> Importance of Avoiding Infections</h4>
                <p><strong>Importance:</strong> ${responses.importance}</p>

                <h4><i class="fas fa-heart icon"></i> Risk Factors</h4>
                <p><strong>Risk Factors:</strong> ${responses.riskFactors.join(', ')}</p>

                <h4><i class="fas fa-clock icon"></i> Testing Frequency</h4>
                <p><strong>Testing Frequency:</strong> ${responses.testingFrequency}</p>
            </div>
        `;
        getElement('summaryContent').innerHTML = summaryContent;
    };

    // Update the URL to reflect the current step
    const updateURL = (step) => {
        history.pushState(null, '', `#${step}`);
    };

    // Navigate to the step based on the URL hash
    const navigateToStepFromURL = () => {
        const hash = window.location.hash.substring(1);
        if (hash && stepOrder.includes(hash)) {
            currentStep = hash;
            stepOrder.forEach(step => {
                getElement(step).style.display = step === currentStep ? 'block' : 'none';
                if (step === currentStep) {
                    getElement(step).classList.add('active');
                } else {
                    getElement(step).classList.remove('active');
                }
            });
            updateProgressBar();
        }
    };

    // Handle browser back/forward navigation
    window.onpopstate = navigateToStepFromURL;

    // Submit the form and evaluate responses
    window.submitForm = () => {
        evaluateResponses();
    };

    // Evaluate user responses and generate the result content
    const evaluateResponses = () => {
        const messages = {
            start: `Based on your responses, starting ${responses.aidType} might be a good option for you.`,
            continue: `You may benefit from continuing ${responses.aidType}.`,
            stop: `You are considering stopping ${responses.aidType}.`,
            not_important: `${responses.aidType} prevention is not a major concern for you.`,
            concerns: `You have concerns about taking ${responses.aidType}.`,
            default: 'It may be useful to discuss your options with a healthcare provider.'
        };

        const getPersonalizedMessage = () => `
            <p>You indicated that your primary motivation is ${responses.motivation.join(', ')} and that ${
                responses.importance === 'very_important' ? `avoiding ${responses.aidType === 'PrEP' ? 'HIV' : 'STIs'} is very important to you.` : 
                responses.importance === 'somewhat_important' ? `avoiding ${responses.aidType === 'PrEP' ? 'HIV' : 'STIs'} is somewhat important to you.` : 
                `avoiding ${responses.aidType === 'PrEP' ? 'HIV' : 'STIs'} is not a major concern for you.`
            }</p>
            <p>Based on your responses, here are some personalized recommendations:</p>
            <ul>
                ${responses.concerns === 'yes' ? '<li>Consider discussing your specific concerns with your healthcare provider.</li>' : ''}
                ${responses.decisionStage === 'close' ? '<li>You are close to making a decision. Gathering the last pieces of information can help you finalize it.</li>' : ''}
                ${responses.decisionStage === 'not_started' ? `<li>You are just starting to think about ${responses.aidType}. Learning more about it can help you get started.</li>` : ''}
                ${responses.riskFactors.includes('positive_partner') ? `<li>Having a partner with a known infection puts you at higher risk. ${responses.aidType} can be an effective preventive measure.</li>` : ''}
                ${responses.riskFactors.includes('multiple_partners') ? '<li>Having multiple sexual partners increases your risk. This can help reduce this risk.</li>' : ''}
                ${responses.riskFactors.includes('inject_drugs') ? '<li>Injecting drugs is a significant risk factor. This can provide additional protection.</li>' : ''}
                ${responses.testingFrequency === 'never' ? '<li>Regular testing is important. Consider getting tested regularly.</li>' : ''}
            </ul>
        `;

        const getResultContent = (resultText, resultClass, actionableSteps, educationalContent) => `
            <div class="card ${resultClass}">
                <h3>${resultText}</h3>
                ${getPersonalizedMessage()}
            </div>
            <div class="card">${actionableSteps}</div>
            <div class="card">${educationalContent}</div>
            <div class="card">
                <h4>Understanding ${responses.aidType} and Your Risks:</h4>
                <p>${responses.aidType} is a medication that can help prevent ${responses.aidType === 'PrEP' ? 'HIV' : 'STIs'} when taken as prescribed.</p>
                <p>Considerations for ${responses.aidType}:</p>
                <ul>
                    <li>${responses.aidType} is for people who are at risk of ${responses.aidType === 'PrEP' ? 'HIV' : 'STIs'} through sexual activity or injection drug use.</li>
                    <li>Regular check-ups and testing are necessary while on ${responses.aidType}.</li>
                    <li>Discuss any concerns or questions with a healthcare provider to determine if ${responses.aidType} is right for you.</li>
                </ul>
                <h4>Additional Resources:</h4>
                <p>For more information about ${responses.aidType}, you can visit the following resources:</p>
                <ul>
                    ${(responses.aidType === 'PrEP' ? prepResources : doxypepResources).map(resource => `<li><a href="${resource.link}" target="_blank">${resource.text}</a></li>`).join('')}
                </ul>
                <img src="images/${responses.aidType.toLowerCase()}-infographic.png" alt="${responses.aidType} Infographic" class="infographic">
                <button type="button" class="restart-button" onclick="restart()">Restart</button>
            </div>
        `;

        let resultText = messages[responses.decision] || messages[responses.importance === 'not_important' ? 'not_important' : responses.concerns === 'yes' ? 'concerns' : 'default'];
        let resultClass = responses.decision === 'start' || responses.decision === 'continue' ? 'success' : 'warning';

        let actionableSteps = `
            <h4>Next Steps:</h4>
            <ul>
                <li>${responses.decision === 'stop' ? `Discuss your reasons for stopping ${responses.aidType} with your healthcare provider to ensure it’s the right choice for you.` : 
                      responses.decision === 'continue' ? `Continue taking ${responses.aidType} as prescribed and attend regular check-ups with your healthcare provider.` : 
                      responses.decision === 'start' ? `Schedule an appointment with your healthcare provider to discuss starting ${responses.aidType}.` : 
                      'Make an appointment with your healthcare provider to explore your options.'}</li>
                <li>Prepare a list of questions or concerns to discuss during your appointment.</li>
            </ul>
            <div class="cta">
                <a href="${ctaLink}" target="_blank" class="button">Get Started with ${responses.aidType}</a>
                <button type="button" class="ghost-button" onclick="showReminderForm()">Remind me to sign up later</button>
                <form id="reminderForm" style="display:none;" onsubmit="submitReminder(event)">
                    <label for="email">Enter your email:</label>
                    <input type="email" id="email" name="email" required>
                    <button type="submit" class="button">Submit</button>
                </form>
            </div>
        `;

        let educationalContent = `
            <h4>${responses.decision === 'start' ? `Benefits of Starting ${responses.aidType}:` : 
                 responses.decision === 'continue' ? `Benefits of Continuing ${responses.aidType}:` : 
                 responses.decision === 'stop' ? `Considerations for Stopping ${responses.aidType}:` : 
                 `Importance of ${responses.aidType === 'PrEP' ? 'HIV' : 'STI'} Prevention:`}</h4>
            <p>${responses.decision === 'start' ? `${responses.aidType} is highly effective in preventing ${responses.aidType === 'PrEP' ? 'HIV' : 'STIs'} when taken as prescribed. It provides an additional layer of protection alongside other preventive measures such as condom use.` : 
                 responses.decision === 'continue' ? `Continuing ${responses.aidType} helps maintain its effectiveness in preventing ${responses.aidType === 'PrEP' ? 'HIV' : 'STIs'}, especially for those at ongoing risk. Regular use and adherence to medical advice are key to its success.` : 
                 responses.decision === 'stop' ? `While stopping ${responses.aidType} might seem like a viable option, it's essential to have a thorough discussion with your healthcare provider to understand the implications and explore other preventive measures.` : 
                 `While it may not be a priority for you now, ${responses.aidType === 'PrEP' ? 'HIV' : 'STI'} prevention is crucial for long-term health. Understanding the benefits of ${responses.aidType} can help you protect yourself and others.`}</p>
        `;

        getElement('result').innerHTML = getResultContent(resultText, resultClass, actionableSteps, educationalContent);
        getElement('decisionAidForm').style.display = 'none';
        getElement('result').style.display = 'block';
    };

    // Handle reminder form submission
    window.submitReminder = (event) => {
        event.preventDefault();
        const email = getElement('email').value;
        alert(validateEmail(email) ? `This is a non-functioning proof of concept prototype. Your email is not caputred and no reminder will be sent.` : 'Please enter a valid email address.');
    };

    // Validate email format
    const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email).toLowerCase());
    window.validateEmail = validateEmail;
    // Show the reminder form
    window.showReminderForm = () => getElement('reminderForm').style.display = 'block';

    // Assign functions to window for global access
    window.selectOption = setResponse;
    window.toggleOption = toggleResponse;
    window.nextStep = nextStep;
    window.prevStep = prevStep;
    window.submitForm = submitForm;
    
    // Reset the form to the initial state
    window.restart = () => {
        // Reset responses
        Object.keys(responses).forEach(key => {
            if (Array.isArray(responses[key])) {
                responses[key] = [];
            } else {
                responses[key] = '';
            }
        });

        // Reset to the initial step
        const initialStep = 'introStep';
        stepOrder.forEach(step => {
            getElement(step).style.display = step === initialStep ? 'block' : 'none';
            if (step === initialStep) {
                getElement(step).classList.add('active');
            } else {
                getElement(step).classList.remove('active');
            }
        });

        // Reset progress bar
        updateProgressBar();

        // Reset URL
        updateURL(initialStep);

        // Hide result section if visible
        getElement('result').style.display = 'none';

        // Show form again
        getElement('decisionAidForm').style.display = 'block';
    };

    // Initialize progress bar and navigation from URL
    updateProgressBar();
    navigateToStepFromURL();
});
