import { useState, useEffect } from 'react';
import Spinner from '../components/Spinner';
import JobListing from '../components/JobListing';

const JobListings = ({ isHome = false }) => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('All');
  const [currentPage, setCurrentPage] = useState(1);
  const jobsPerPage = 6;
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  const [appliedJobs, setAppliedJobs] = useState([]);

  useEffect(() => {
    const fetchJobs = async () => {
      const apiUrl = 'https://job-listings-api-z99n.onrender.com/jobs';

      try {
        const res = await fetch(apiUrl);
        const data = await res.json();

        setJobs(isHome ? data.slice(0, 3) : data);
      } catch (error) {
        console.log('Error fetching data', error);
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, [isHome]);

  //Filter and Search

  const filteredJobs = jobs.filter((job) => {
    const search = searchTerm.toLowerCase();

    const matchesSearch =
      job.title.toLowerCase().includes(search) ||
      job.company.name.toLowerCase().includes(search) ||
      job.location.toLowerCase().includes(search);

    const matchesType = typeFilter === 'All' || job.type === typeFilter;

    return matchesSearch && matchesType;
  });

  const totalPages = Math.ceil(filteredJobs.length / jobsPerPage);
  // Pagination

  const indexOfLastJob = currentPage * jobsPerPage;
  const indexOfFirstJob = indexOfLastJob - jobsPerPage;

  const currentJobs = filteredJobs.slice(indexOfFirstJob, indexOfLastJob);

  //Apply job

  const openApplyModal = (job) => {
    setSelectedJob(job);
    setShowApplyModal(true);
  };

  const submitApplication = (e) => {
    e.preventDefault();

    const exists = appliedJobs.find((j) => j.id === selectedJob.id);

    if (exists) {
      alert('Already applied!');
      return;
    }

    setAppliedJobs([...appliedJobs, selectedJob]);
    setShowApplyModal(false);
    alert(`Applied for ${selectedJob.title}`);
  };

  return (
    <section className="bg-blue-50 px-4 py-10">
      <div className="container-xl lg:container m-auto">
        <h2 className="text-3xl font-bold text-indigo-500 mb-6 text-center">
          {isHome ? 'Recent Jobs' : 'All Jobs'}
        </h2>
        {!isHome && (
          <div className="flex justify-end">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full md:w-fit">
              <input
                type="text"
                placeholder="Search jobs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full md:w-60 h-10 px-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="w-full md:w-60 h-10 px-3 border rounded-lg mb-4"
              >
                <option value="All">All Types</option>
                <option value="Full-Time">Full-Time</option>
                <option value="Part-Time">Part-Time</option>
              </select>
            </div>
          </div>
        )}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {loading ? (
            <div className="col-span-full">
              <Spinner loading={loading} />
            </div>
          ) : filteredJobs.length === 0 ? (
            <p className="col-span-full text-center text-gray-500">
              No jobs found 😕
            </p>
          ) : (
            currentJobs.map((job) => (
              <JobListing
                key={job.id}
                job={job}
                onApply={openApplyModal}
                appliedJobs={appliedJobs}
              />
            ))
          )}
        </div>
        {!isHome && (
          <div className="flex justify-center gap-2 mt-6">
            <button
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
            >
              Prev
            </button>

            <button
              onClick={() => setCurrentPage((p) => p + 1)}
              disabled={currentPage === totalPages}
              className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
            >
              Next
            </button>
          </div>
        )}
      </div>

      {showApplyModal && selectedJob && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
          <div className="bg-white p-6 rounded-lg w-[300px]">
            <h2 className="text-xl font-bold mb-4">
              Apply for {selectedJob.title}
            </h2>

            <form onSubmit={submitApplication}>
              <input className="w-full border p-2 mb-3" placeholder="Name" />
              <input className="w-full border p-2 mb-3" placeholder="Email" />

              <button className="w-full bg-green-500 text-white p-2 rounded">
                Submit
              </button>
            </form>

            <button
              onClick={() => setShowApplyModal(false)}
              className="mt-3 text-red-500"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </section>
  );
};

export default JobListings;
