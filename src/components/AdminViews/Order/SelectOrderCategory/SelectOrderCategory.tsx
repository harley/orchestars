'use client'

import { SelectInput, TextInput } from '@payloadcms/ui'
import React, { useEffect, useState } from 'react'
import { useFormContext } from 'react-hook-form'

export const SelectOrderCategory = ({
  isSubmitSuccessful,
  ...props
}: {
  path: string
  [k: string]: any
}) => {
  const options = [
    {
      label: 'Order Gift',
      value: 'order_gift',
    },
    {
      label: 'Order Payment',
      value: 'order_payment',
    },
    {
      label: 'Other',
      value: 'other',
    },
  ]
  const { setValue, watch } = useFormContext()

  const orderCategoryValue = watch(props.path)
  const [otherCategory, setOtherCategory] = useState('')
  const [tempOrderCategory, setTempOrderCategory] = useState('')

  useEffect(() => {
    if (orderCategoryValue && !['order_gift', 'order_payment'].includes(orderCategoryValue)) {
      setTempOrderCategory('other')
      setOtherCategory(orderCategoryValue)
    } else {
      setTempOrderCategory(orderCategoryValue)
    }

    // eslint-disable-next-line
  }, [])

  useEffect(() => {
    if (tempOrderCategory == 'other') {
      setValue(props.path, otherCategory)
    }
  }, [props.path, setValue, tempOrderCategory, otherCategory])

  useEffect(() => {
    if (isSubmitSuccessful) {
      // reset value
      setValue(props.path, undefined)
      setOtherCategory('')
      setTempOrderCategory('')
    }
  }, [setValue, props.path, isSubmitSuccessful])

  return (
    <div className="field-type">
      <label htmlFor="" className="field-label">
        Order Category
      </label>
      <div>
        <SelectInput
          path={props.path}
          options={options}
          value={tempOrderCategory as string}
          name="category"
          onChange={(option) => {
            const value = (option as any).value
            setValue(props.path, value)
            setTempOrderCategory(value)
          }}
        />
        {tempOrderCategory === 'other' && (
          <TextInput
            style={{ marginTop: 12 }}
            path="otherCategory"
            placeholder="Enter your other order category"
            value={otherCategory}
            onChange={(e: any) => {
              setOtherCategory(e.target.value)
              setValue(props.path, e.target.value as string)
            }}
          />
        )}
      </div>
    </div>
  )
}

export default SelectOrderCategory
