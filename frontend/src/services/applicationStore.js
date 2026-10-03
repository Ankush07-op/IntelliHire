const STORAGE_KEY = "intellihire_applications";

const defaultApplications = [
  {
    id: 1,
    candidate: "Rahul Sharma",
    email: "rahul.sharma@gmail.com",
    phone: "+91 9876543210",
    location: "Bangalore",
    education: "B.Tech Computer Science",
    experience: "2 years",
    skills: ["React", "JavaScript", "HTML", "CSS"],
    summary: "Frontend developer with experience building responsive web applications.",
    job: "Frontend Developer",
    appliedDate: "2026-09-25",
    status: "Pending",
  },
  {
    id: 2,
    candidate: "Priya Singh",
    email: "priya.singh@gmail.com",
    phone: "+91 9876543211",
    location: "Bangalore",
    education: "B.Tech Information Technology",
    experience: "1.5 years",
    skills: ["React", "JavaScript", "Bootstrap"],
    summary: "Frontend developer focused on modern React applications.",
    job: "Frontend Developer",
    appliedDate: "2026-09-24",
    status: "Shortlisted",
  },
  {
    id: 3,
    candidate: "Amit Kumar",
    email: "amit.kumar@gmail.com",
    phone: "+91 9876543212",
    location: "Delhi",
    education: "B.Tech Computer Science",
    experience: "3 years",
    skills: ["Node.js", "Express", "MongoDB"],
    summary: "Backend developer experienced in REST APIs and server-side development.",
    job: "Backend Developer",
    appliedDate: "2026-09-23",
    status: "Interview",
  },
  {
    id: 4,
    candidate: "Neha Verma",
    email: "neha.verma@gmail.com",
    phone: "+91 9876543213",
    location: "Mumbai",
    education: "MCA",
    experience: "2 years",
    skills: ["Node.js", "Express", "PostgreSQL"],
    summary: "Backend developer with experience in API development and databases.",
    job: "Backend Developer",
    appliedDate: "2026-09-22",
    status: "Pending",
  },
  {
    id: 5,
    candidate: "Arjun Patel",
    email: "arjun.patel@gmail.com",
    phone: "+91 9876543214",
    location: "Ahmedabad",
    education: "B.Tech Computer Science",
    experience: "2.5 years",
    skills: ["React", "Node.js", "MongoDB"],
    summary: "Full stack developer with experience across frontend and backend technologies.",
    job: "Full Stack Developer",
    appliedDate: "2026-09-21",
    status: "Shortlisted",
  },
  {
    id: 6,
    candidate: "Sneha Gupta",
    email: "sneha.gupta@gmail.com",
    phone: "+91 9876543215",
    location: "Pune",
    education: "MCA",
    experience: "1 year",
    skills: ["React", "JavaScript", "CSS"],
    summary: "Frontend developer interested in building user-friendly web applications.",
    job: "Frontend Developer",
    appliedDate: "2026-09-20",
    status: "Rejected",
  },
];

export const getApplications = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);

    if (stored) {
      return JSON.parse(stored);
    }

    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(defaultApplications)
    );

    return defaultApplications;
  } catch (error) {
    console.error("Failed to load applications:", error);
    return defaultApplications;
  }
};

export const saveApplications = (applications) => {
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(applications)
    );

    window.dispatchEvent(
      new CustomEvent("applicationsUpdated", {
        detail: applications,
      })
    );
  } catch (error) {
    console.error("Failed to save applications:", error);
  }
};

export const updateApplicationStatus = (applicationId, status) => {
  const applications = getApplications();

  const updatedApplications = applications.map(
    (application) =>
      application.id === applicationId
        ? { ...application, status }
        : application
  );

  saveApplications(updatedApplications);

  return updatedApplications;
};

export default STORAGE_KEY;