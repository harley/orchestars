import React from 'react'

const TermCondition = ({ termCondition }: { termCondition: string }) => {
  return (
    <section className="py-12 bg-gray-50">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold mb-8 text-center">Điều Khoản và Chính Sách</h2>

        <div className=" mx-auto">
          <div className="mt-8 p-6 bg-white rounded-lg shadow-md">
            <pre
              dangerouslySetInnerHTML={{ __html: termCondition }}
              className="whitespace-pre-wrap"
            ></pre>
          </div>
        </div>
      </div>
    </section>
  )
}

export default TermCondition
