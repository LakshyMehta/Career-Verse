import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { Briefcase, Building, Search } from "lucide-react";

const Index = () => {
  const { user } = useAuth();

  return (
    <div className="flex min-h-screen flex-col">
      {/* Hero section */}
      <section className="bg-gradient-to-br from-blue-900 to-blue-700 py-24 text-white">
        <div className="container mx-auto px-4 text-center">
          <h1 className="mb-6 text-4xl font-extrabold md:text-5xl lg:text-6xl">
            Let your destiny lie beneath your feet.          </h1>
          <p className="mx-auto mb-8 max-w-2xl text-lg text-blue-100 md:text-xl">
            Connect with top employers and discover opportunities that match your skills and aspirations.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            {user ? (
              <Link to="/dashboard">
                <Button size="lg" className="bg-white text-blue-700 hover:bg-blue-50">
                  Go to Dashboard
                </Button>
              </Link>
            ) : (
              <>
                <Link to="/register">
                  <Button size="lg" className="bg-white text-blue-700 hover:bg-blue-50">
                    Get Started
                  </Button>
                </Link>
                <Link to="/login">
                  <Button size="lg" className="bg-white text-blue-700 hover:bg-blue-50">
                    Sign In
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Features section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <h2 className="mb-12 text-center text-3xl font-bold">How CareerVerse Works</h2>
          <div className="grid gap-8 md:grid-cols-3">
            <div className="rounded-lg p-6 text-center shadow-lg">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                <Search className="h-8 w-8" />
              </div>
              <h3 className="mb-3 text-xl font-semibold">Find Opportunities</h3>
              <p className="text-gray-600">
                Browse thousands of job listings from top companies across various industries.
              </p>
            </div>
            <div className="rounded-lg p-6 text-center shadow-lg">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                <Briefcase className="h-8 w-8" />
              </div>
              <h3 className="mb-3 text-xl font-semibold">Apply with Ease</h3>
              <p className="text-gray-600">
                Create a profile, upload your resume, and apply to jobs with just a few clicks.
              </p>
            </div>
            <div className="rounded-lg p-6 text-center shadow-lg">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                <Building className="h-8 w-8" />
              </div>
              <h3 className="mb-3 text-xl font-semibold">Connect with Employers</h3>
              <p className="text-gray-600">
                Communicate directly with hiring managers and receive feedback on your applications.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured jobs section */}
      {/* <section className="bg-gray-50 py-20">
        <div className="container mx-auto px-4">
          <h2 className="mb-12 text-center text-3xl font-bold">Featured Job Opportunities</h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((job) => (
              <div key={job} className="rounded-lg bg-white p-6 shadow-md">
                <div className="mb-4 flex items-start justify-between">
                  <div>
                    <h3 className="text-xl font-semibold">Software Engineer</h3>
                    <p className="text-gray-600">TechCorp Inc.</p>
                  </div>
                  <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-800">
                    Full-time
                  </span>
                </div>
                <div className="mb-4 space-y-2">
                  <div className="flex items-center text-gray-600">
                    <span className="mr-2">📍</span>
                    <span>Remote (US)</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <span className="mr-2">💰</span>
                    <span>$100K - $130K</span>
                  </div>
                </div>
                <p className="mb-6 text-gray-600">
                  We're looking for a talented software engineer to join our growing team...
                </p>
                <Button className="w-full">View Details</Button>
              </div>
            ))}
          </div>
          <div className="mt-10 text-center">
            <Link to="/jobs">
              <Button variant="outline">View All Jobs</Button>
            </Link>
          </div>
        </div>
      </section> */}

      {/* CTA section */}
      <section className="bg-blue-600 py-16 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="mb-6 text-3xl font-bold">Ready to Start Your Career Journey?</h2>
          <p className="mx-auto mb-8 max-w-2xl text-lg text-blue-100">
            Join thousands of professionals who have found their dream jobs through CareerVerse.
          </p>
          <Link to="/register">
            <Button size="lg" className="bg-white text-blue-700 hover:bg-blue-50">
              Create Your Account
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 py-12 text-gray-400">
        <div className="container mx-auto px-4">
          <div className="grid gap-8 md:grid-cols-4">
            <div>
              <h3 className="mb-4 text-xl font-bold text-white">CareerVerse</h3>
              <p>Connecting talent with opportunity since 2025lo.</p>
            </div>
            <div>
              <h4 className="mb-4 font-semibold text-white">For Job Seekers</h4>
              <ul className="space-y-2">
                <li><a href="#" className="hover:text-white">Browse Jobs</a></li>
                <li><a href="#" className="hover:text-white">Create Profile</a></li>
                <li><a href="#" className="hover:text-white">Job Alerts</a></li>
              </ul>
            </div>
            <div>
              <h4 className="mb-4 font-semibold text-white">For Employers</h4>
              <ul className="space-y-2">
                <li><a href="#" className="hover:text-white">Post a Job</a></li>
                <li><a href="#" className="hover:text-white">Browse Candidates</a></li>
              </ul>
            </div>
            {/*<div>
              <h4 className="mb-4 font-semibold text-white">Company</h4>
              <ul className="space-y-2">
                <li><a href="#" className="hover:text-white">About Us</a></li>
                <li><a href="#" className="hover:text-white">Contact</a></li>
                <li><a href="#" className="hover:text-white">Privacy Policy</a></li>
              </ul>
            </div>*/}
          </div>
          <div className="mt-8 border-t border-gray-800 pt-8 text-center">
            <p>&copy; 2023 CareerVerse. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
