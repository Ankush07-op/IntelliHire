import axiosInstance from "../../../api/axiosInstance";

export async function login({ email, password }) {
  const { data } = await axiosInstance.post("/auth/login", { email, password });
  return {
    token: data.token,
    user: {
      _id: data._id,
      id: data._id,
      name: data.name,
      email: data.email,
      role: data.role,
    },
  };
}

export async function register({ name, email, password }) {
  const { data } = await axiosInstance.post("/auth/register", {
    name,
    email,
    password,
    role: "applicant",
  });
  return {
    token: data.token,
    user: {
      _id: data._id,
      id: data._id,
      name: data.name,
      email: data.email,
      role: data.role,
    },
  };
}