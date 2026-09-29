'use client'
// import React from 'react';
import React, { useContext, useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { LiveProvider, LiveEditor, LiveError, LivePreview } from 'react-live'
import decodeToken from '../components/decodeToken'
import { useInfoMsg } from '@/app/components/infoMsgHandler'
import { faker } from '@faker-js/faker'
import i18n from '../components/i18n'
import { eventBus } from '../eventBus'
import { getCookie } from '../components/cookieMgment'
import * as R_icons from 'react-icons/io5'
import axios from 'axios'
import * as UI from '@/components'
import { useTheme } from '@/hooks/useTheme'
import clsx from 'clsx'
import {
  Cell,
  Pie,
  PieChart,
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  XAxis,
  YAxis
} from 'recharts'
import { Tooltip } from '@/components'
import { QRCodeSVG } from 'qrcode.react'

const NodeData = ({previewCode=""}:any) => {

if(previewCode!="")
{
  return (
    <div className='w-full h-full'>
      <LiveProvider
        code={previewCode}
        scope={{
          ...UI,
          ...R_icons,
          React,
          Cell,
          Pie,
          PieChart,
          Bar,
          BarChart,
          CartesianGrid,
          Legend,
          Line,
          LineChart,
          QRCodeSVG,
          ResponsiveContainer,
          Tooltip,
          XAxis,
          YAxis,
          clsx,
          useTheme,
          useState,
          useContext,
          useEffect,
          useRef,
          useRouter,
          useInfoMsg,
          faker,
          i18n,
          getCookie,
          eventBus
        }}
      >
        <LiveError />
        <LivePreview />
      </LiveProvider>
    </div>
  )
}else{
    return <div>not there</div>
}

}

export default NodeData