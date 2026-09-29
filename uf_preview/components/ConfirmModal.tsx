
'use client'
import { Modal } from '@/components/Modal'
import { Button } from '@/components/Button'
import React from 'react'

export const ConfirmModal = ({confirmMsg, setConfirmMsg, confirmMsgTitle, confirmMsgContent, handleConfirm}:any) => {
  const handleClose = () => {
    setConfirmMsg(false)
  }

  const handleConfirmClick = () => {
    setConfirmMsg(false)
    handleConfirm()
  }

  return (
    <Modal
      open={confirmMsg}
      onClose={handleClose}
      title={confirmMsgTitle}
      showCloseButton={true}
      closeOnOverlayClick={false}
      closeOnEscape={true}
      className='p-5'
      footer={
        <div className='flex justify-end gap-3 w-full'>
          <Button
          
            view="outlined"
            onClick={handleClose}
          >
            Cancel
          </Button>
          <Button
       
             view="outlined"
            onClick={handleConfirmClick}
            className="bg-red-500 hover:bg-red-600 text-white"
          >
            Confirm
          </Button>
        </div>
      }
    >
      <div className='text-center p-4'>
        <p>
          {confirmMsgContent}
        </p>
      </div>
    </Modal>
  )
}

