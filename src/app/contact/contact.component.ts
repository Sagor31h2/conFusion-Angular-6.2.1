import { Component, OnInit, ViewChild, Inject } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { Feedback, ContactType } from "../shared/feedback";
import { flyInOut } from "../animations/app.animation";
import { FeedbackService } from "../services/feedback.service";
@Component({
  selector: "app-contact",
  templateUrl: "./contact.component.html",
  styleUrls: ["./contact.component.scss"],
  host: {
    "[@flyInOut]": "true",
    style: "display: block;",
  },
  animations: [flyInOut()],
})
export class ContactComponent implements OnInit {
  feedbackForm: FormGroup;
  feedback: Feedback;
  contactType = ContactType;
  feedbackCopy: Feedback;
  errMsg: string;
  @ViewChild("fform") feedbackFormDirective;
  showForm = true;
  showFeedback = false;
  showSpinner = false;

  formErrors = {
    firstname: "",
    lastname: "",
    telnum: "",
    email: "",
  };

  validationMessages = {
    firstname: {
      required: "First Name is required.",
      minlength: "First Name must be at least 2 characters long.",
      maxlength: "FirstName cannot be more than 25 characters long.",
    },
    lastname: {
      required: "Last Name is required.",
      minlength: "Last Name must be at least 2 characters long.",
      maxlength: "Last Name cannot be more than 25 characters long.",
    },
    telnum: {
      required: "Tel. number is required.",
      pattern: "Tel. number must contain only numbers.",
    },
    email: {
      required: "Email is required.",
      email: "Email not in valid format.",
    },
  };

  constructor(
    private fb: FormBuilder,
    private feedbackService: FeedbackService,
    @Inject("BaseURL") public BaseURL
  ) {
    this.createForm();
  }

  ngOnInit() {}

  createForm() {
    this.feedbackForm = this.fb.group({
      firstname: [
        "",
        [
          Validators.required,
          Validators.minLength(2),
          Validators.maxLength(25),
        ],
      ],
      lastname: [
        "",
        [
          Validators.required,
          Validators.minLength(2),
          Validators.maxLength(25),
        ],
      ],
      telnum: [0, [Validators.required, Validators.pattern]],
      email: ["", [Validators.required, Validators.email]],
      agree: false,
      contacttype: "None",
      message: "",
    });

    this.feedbackForm.valueChanges.subscribe((data) =>
      this.onValueChanged(data)
    );

    this.onValueChanged(); // (re)set validation messages now
  }

  onValueChanged(data?: any) {
    if (!this.feedbackForm) {
      return;
    }
    const form = this.feedbackForm;
    for (const field in this.formErrors) {
      if (this.formErrors.hasOwnProperty(field)) {
        // clear previous error message (if any)
        this.formErrors[field] = "";
        const control = form.get(field);
        if (control && control.dirty && !control.valid) {
          const messages = this.validationMessages[field];
          for (const key in control.errors) {
            if (control.errors.hasOwnProperty(key)) {
              this.formErrors[field] += messages[key] + " ";
            }
          }
        }
      }
    }
  }
  onSubmit() {
    this.showForm = false;
    this.showSpinner = true;
    this.feedbackCopy = this.feedbackForm.value;
    this.feedbackService.submitFeedback(this.feedbackCopy).subscribe(
      (feedback) => {
        this.feedback = feedback;
        this.feedbackCopy = feedback;
        this.showSpinner = false;
        this.showFeedback = true;
        setTimeout(() => {
          this.showForm = true;
          this.showFeedback = false;
          this.feedback = null;
          this.feedbackCopy = null;
        }, 5000);
      },
      (errmess) => {
        this.feedback = null;
        this.feedbackCopy = null;
        this.errMsg = <any>errmess;
      }
    );
    this.feedbackForm.reset({
      firstname: "",
      lastname: "",
      telnum: "",
      email: "",
      agree: false,
      contacttype: "None",
      message: "",
    });
    this.feedbackFormDirective.resetForm();
  }
}
